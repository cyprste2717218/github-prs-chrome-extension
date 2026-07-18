// Generates raw popup screenshots for Chrome Web Store assets by loading the
// actual built extension (dist/) in a real browser via Puppeteer and seeding
// chrome.storage.local directly, bypassing the GitHub API.
//
// Usage: node scripts/store-assets/seed-and-capture.mjs
// Requires: npm run build to have produced dist/ first.

import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const EXTENSION_PATH = path.join(ROOT, "dist");
const OUT_DIR = path.join(__dirname, "output");
const POPUP_WIDTH = 420;
const POPUP_HEIGHT = 760;

fs.mkdirSync(OUT_DIR, { recursive: true });

const BASE_STORAGE = {
  username: "octocat-dev",
  repoDetails: null,
  patCode: null,
  reposToggled: false,
  numPageResults: 0,
  activeResultsPage: 1,
  pollingRate: 50,
  lastUpdated: "Sat, 18 Jul 2026 09:32:00 GMT",
};

const TRACKED_REPOS = [
  { name: "react-dashboard", numActivePRs: 7 },
  { name: "api-gateway", numActivePRs: 3 },
  { name: "data-pipeline", numActivePRs: 12 },
  { name: "design-system", numActivePRs: 1 },
];

const PREVIEW_REPOS = [
  {
    step: 3,
    name: "react-dashboard",
    description: "Internal analytics dashboard built with React and D3.",
    language: "TypeScript",
    clone_url: "https://github.com/octocat-dev/react-dashboard",
    topics: ["react", "dashboard", "analytics"],
  },
  {
    step: 3,
    name: "api-gateway",
    description: "Shared API gateway service handling auth and routing.",
    language: "Go",
    clone_url: "https://github.com/octocat-dev/api-gateway",
    topics: ["go", "microservices"],
  },
  {
    step: 3,
    name: "data-pipeline",
    description: "ETL pipeline for ingesting and transforming event data.",
    language: "Python",
    clone_url: "https://github.com/octocat-dev/data-pipeline",
    topics: ["python", "etl", "airflow"],
  },
  {
    step: 3,
    name: "design-system",
    description: "Shared component library and design tokens.",
    language: "TypeScript",
    clone_url: "https://github.com/octocat-dev/design-system",
    topics: ["design-system", "storybook"],
  },
];

const scenes = [
  {
    name: "01-tracked-repos",
    storage: {
      ...BASE_STORAGE,
      step: 4,
      activeNumPRs: TRACKED_REPOS,
    },
  },
  {
    name: "02-settings",
    storage: {
      ...BASE_STORAGE,
      step: 5,
      activeNumPRs: TRACKED_REPOS,
    },
  },
  {
    name: "03-welcome",
    storage: {
      ...BASE_STORAGE,
      step: 1,
      activeNumPRs: [],
    },
  },
  {
    name: "04-choose-repos",
    storage: {
      ...BASE_STORAGE,
      step: 3,
      repoDetails: PREVIEW_REPOS,
      activeNumPRs: [],
    },
    // Repo names to click checked after the popup renders, for a natural-
    // looking mixed selection (checkbox state can't be seeded via storage).
    checkRepos: ["react-dashboard", "data-pipeline", "design-system"],
  },
];

async function seedStorage(worker, storage) {
  const stringified = Object.fromEntries(
    Object.entries(storage).map(([k, v]) => [k, JSON.stringify(v)])
  );
  await worker.evaluate((data) => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(data, () => {
        const err = chrome.runtime.lastError;
        if (err) reject(err);
        else resolve(true);
      });
    });
  }, stringified);
}

async function main() {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: false,
    pipe: true,
    enableExtensions: [EXTENSION_PATH],
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "-enable-unsafe-extension-debugging",
    ],
  });

  await browser.installExtension(EXTENSION_PATH);

  const workerTarget = await browser.waitForTarget(
    (target) =>
      target.type() === "service_worker" &&
      target.url().endsWith("service-worker.js")
  );
  const worker = await workerTarget.worker();
  if (!worker) throw new Error("Service worker not found");
  // The worker's extension APIs (chrome.storage, chrome.runtime) attach
  // slightly after the worker target itself becomes available.
  await new Promise((r) => setTimeout(r, 1000));

  for (const scene of scenes) {
    console.log(`Seeding scene: ${scene.name}`);
    await seedStorage(worker, scene.storage);

    await worker.evaluate("chrome.action.openPopup();");

    const popupTarget = await browser.waitForTarget(
      (target) =>
        target.type() === "page" && target.url().endsWith("index.html")
    );
    const popupPage = await popupTarget.asPage();
    await popupPage.setViewport({ width: POPUP_WIDTH, height: POPUP_HEIGHT });
    await popupPage.waitForNetworkIdle({ idleTime: 300 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 600));

    if (scene.checkRepos) {
      for (const name of scene.checkRepos) {
        await popupPage.click(`#check${name}`);
      }
      await new Promise((r) => setTimeout(r, 200));
    }

    // Hide scrollbars and measure true content height (the app uses an
    // inner scrolling container, not document-level overflow).
    const contentHeight = await popupPage.evaluate(() => {
      const style = document.createElement("style");
      style.textContent = "* { scrollbar-width: none !important; } *::-webkit-scrollbar { display: none !important; }";
      document.head.appendChild(style);
      const root = document.getElementById("root") ?? document.body;
      return Math.max(
        root.scrollHeight,
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
    });
    await popupPage.setViewport({
      width: POPUP_WIDTH,
      height: Math.min(Math.max(contentHeight + 20, 300), 900),
    });
    await new Promise((r) => setTimeout(r, 200));

    const outPath = path.join(OUT_DIR, `${scene.name}.png`);
    await popupPage.screenshot({ path: outPath, fullPage: false });
    console.log(`  -> ${outPath}`);

    await popupPage.close();
  }

  await browser.close();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
