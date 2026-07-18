// Composes the raw popup screenshots (from seed-and-capture.mjs) into
// Chrome Web Store-ready assets: two 1280x800 screenshots, a 440x280 small
// promo tile, and a 1400x560 marquee promo tile. Pure HTML/CSS rendered via
// Puppeteer — no image-processing deps required.
//
// The embedded popup screenshots are placed at their native captured pixel
// dimensions — never resized/rescaled — so nothing about them is stretched
// or compressed once they're overlaid on the background/frame/copy.

import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const OUT_DIR = path.join(__dirname, "output");

function pngDims(buf) {
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function toDataUri(relPath) {
  const buf = fs.readFileSync(path.join(OUT_DIR, relPath));
  return {
    uri: `data:image/png;base64,${buf.toString("base64")}`,
    ...pngDims(buf),
  };
}

function toDataUriFromPublic(relPath) {
  const buf = fs.readFileSync(path.join(ROOT, "public", relPath));
  return `data:image/png;base64,${buf.toString("base64")}`;
}

const ICON = toDataUriFromPublic("icon128.png");
const TRACKED_SHOT = toDataUri("01-tracked-repos.png");
const SETTINGS_SHOT = toDataUri("02-settings.png");
const CHOOSE_REPOS_SHOT = toDataUri("04-choose-repos.png");

const FONT_STACK = `'Source Code Pro', 'Courier New', monospace`;
const BRAND_YELLOW = "#f5c518";
const INK = "#1a1a1a";

const baseStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: ${FONT_STACK};
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }
  .bg {
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 15% 15%, #fff9e6 0%, #ffffff 45%, #fdf6df 100%);
    display: flex;
    align-items: center;
    position: relative;
  }
  .browser-chrome {
    background: #fff;
    border-radius: 14px;
    box-shadow: 0 30px 60px -15px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.06);
    overflow: hidden;
  }
  .browser-toolbar {
    height: 40px;
    background: #eceef1;
    display: flex;
    align-items: center;
    padding: 0 14px;
    gap: 8px;
    border-bottom: 1px solid #dcdfe4;
  }
  .dot { width: 11px; height: 11px; border-radius: 50%; }
  .popup-shot {
    display: block;
  }
  .puzzle-badge {
    position: absolute;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

function screenshotSceneHtml({ shot, heading, subheading }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${baseStyles}
    .layout { display: flex; width: 100%; height: 100%; align-items: center; padding: 0 90px; gap: 70px; }
    .copy { flex: 0 0 420px; }
    .copy .icon { width: 64px; height: 64px; margin-bottom: 28px; }
    .copy h1 { font-size: 40px; line-height: 1.15; color: ${INK}; margin-bottom: 18px; }
    .copy p { font-size: 18px; line-height: 1.5; color: #444; }
    .accent { color: ${BRAND_YELLOW}; -webkit-text-stroke: 1px ${INK}; }
    .frame-wrap { position: relative; flex: 1; display: flex; justify-content: center; }
    .browser-chrome { width: ${shot.width + 8}px; }
    .browser-toolbar .dot:nth-child(1) { background: #ff5f57; }
    .browser-toolbar .dot:nth-child(2) { background: #febc2e; }
    .browser-toolbar .dot:nth-child(3) { background: #28c840; }
    .puzzle-badge { top: 46px; right: -22px; width: 44px; height: 44px; }
    .puzzle-badge img { width: 26px; height: 26px; }
  </style></head>
  <body>
    <div class="bg">
      <div class="layout">
        <div class="copy">
          <img class="icon" src="${ICON}" />
          <h1>${heading}</h1>
          <p>${subheading}</p>
        </div>
        <div class="frame-wrap">
          <div class="browser-chrome">
            <div class="browser-toolbar">
              <div class="dot"></div><div class="dot"></div><div class="dot"></div>
            </div>
            <img class="popup-shot" src="${shot.uri}" width="${shot.width}" height="${shot.height}" />
          </div>
          <div class="puzzle-badge"><img src="${ICON}" /></div>
        </div>
      </div>
    </div>
  </body></html>`;
}

function smallPromoHtml() {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${baseStyles}
    .bg { justify-content: center; flex-direction: column; text-align: center; gap: 14px; background: linear-gradient(135deg, #fff6da 0%, #ffffff 60%); }
    .icon { width: 84px; height: 84px; }
    h1 { font-size: 22px; color: ${INK}; }
    p { font-size: 14px; color: #555; max-width: 360px; }
  </style></head>
  <body>
    <div class="bg">
      <img class="icon" src="${ICON}" />
      <h1>Github PR Tracker</h1>
      <p>Track open pull requests across your repos, right from your toolbar.</p>
    </div>
  </body></html>`;
}

function marqueeHtml() {
  // The marquee canvas (1400x560) is too short to fit the popup screenshot
  // at its native captured size (a tall, portrait-oriented popup). Unlike
  // the store screenshots, it has to be scaled down to fit here — but
  // uniformly, by the same factor on both axes, so the aspect ratio (and
  // everything drawn inside it) stays exactly proportional. That's
  // different from the earlier bug, which stretched width and height by
  // *different* factors and visibly distorted the image.
  const availableWidth = 1400 - 110 * 2 - 520 - 90;
  const toolbarHeight = 40;
  const availableImageHeight = 560 - 40 - toolbarHeight;
  const scale = Math.min(
    availableWidth / TRACKED_SHOT.width,
    availableImageHeight / TRACKED_SHOT.height,
    1
  );
  const imgWidth = Math.round(TRACKED_SHOT.width * scale);
  const imgHeight = Math.round(TRACKED_SHOT.height * scale);

  return `<!doctype html><html><head><meta charset="utf-8"><style>${baseStyles}
    .layout { display: flex; width: 100%; height: 100%; align-items: center; padding: 0 110px; gap: 90px; }
    .copy { flex: 0 0 520px; }
    .copy .icon { width: 84px; height: 84px; margin-bottom: 26px; }
    .copy h1 { font-size: 48px; line-height: 1.15; color: ${INK}; margin-bottom: 16px; }
    .copy p { font-size: 20px; line-height: 1.5; color: #444; }
    .frame-wrap { position: relative; flex: 1; display: flex; justify-content: center; }
    .browser-chrome { width: ${imgWidth + 8}px; }
    .browser-toolbar .dot:nth-child(1) { background: #ff5f57; }
    .browser-toolbar .dot:nth-child(2) { background: #febc2e; }
    .browser-toolbar .dot:nth-child(3) { background: #28c840; }
  </style></head>
  <body>
    <div class="bg">
      <div class="layout">
        <div class="copy">
          <img class="icon" src="${ICON}" />
          <h1>Github PR Tracker</h1>
          <p>See at a glance how many pull requests are open across every repository you track.</p>
        </div>
        <div class="frame-wrap">
          <div class="browser-chrome">
            <div class="browser-toolbar"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
            <img class="popup-shot" src="${TRACKED_SHOT.uri}" width="${imgWidth}" height="${imgHeight}" />
          </div>
        </div>
      </div>
    </div>
  </body></html>`;
}

async function renderToPng(html, width, height, outPath) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "load" });
  await page.screenshot({ path: outPath });
  await browser.close();
  console.log(`  -> ${outPath}`);
}

async function main() {
  const shots = [
    {
      out: "store-screenshot-1-tracked-repos.png",
      shot: TRACKED_SHOT,
      heading: `Track every open <span class="accent">PR</span>, at a glance`,
      subheading:
        "See open pull request counts across all your tracked GitHub repositories, right from your toolbar.",
    },
    {
      out: "store-screenshot-2-settings.png",
      shot: SETTINGS_SHOT,
      heading: "Poll on your schedule",
      subheading:
        "Choose how often the extension checks GitHub, from once a minute to once every 10.",
    },
    {
      out: "store-screenshot-3-choose-repos.png",
      shot: CHOOSE_REPOS_SHOT,
      heading: "Pick exactly what to track",
      subheading:
        "Enter any GitHub user or organization, then browse their repositories and choose which ones to track for open pull requests.",
    },
  ];

  for (const entry of shots) {
    console.log(`Rendering ${entry.out}`);
    const html = screenshotSceneHtml(entry);
    await renderToPng(html, 1280, 800, path.join(OUT_DIR, entry.out));
  }

  console.log("Rendering small-promo-tile.png");
  await renderToPng(
    smallPromoHtml(),
    440,
    280,
    path.join(OUT_DIR, "small-promo-tile.png")
  );

  console.log("Rendering marquee-promo-tile.png");
  await renderToPng(
    marqueeHtml(),
    1400,
    560,
    path.join(OUT_DIR, "marquee-promo-tile.png")
  );

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
