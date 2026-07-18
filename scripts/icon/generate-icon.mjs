// Regenerates public/icon{16,32,48,128}.png from a single vector source, so
// the glyph stays crisp and legible at toolbar sizes (the previous icon's
// thin strokes disappeared into a blob at 16-32px).
//
// Renders the source SVG once at high resolution, then downsamples to each
// target size via <canvas> with high-quality smoothing — rendering text
// natively at e.g. 16px in headless Chromium looks noticeably blurrier than
// downsampling from a larger bitmap.
//
// Usage: node scripts/icon/generate-icon.mjs

import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const PUBLIC_DIR = process.env.ICON_OUT_DIR
  ? path.resolve(process.env.ICON_OUT_DIR)
  : path.join(ROOT, "public");

const BRAND_GOLD = "#F5C518";
const SOURCE_SIZE = 1024;
const SIZES = [16, 32, 48, 128];

// Git branch/fork mark: a trunk splitting into two branches, each capped
// with a node dot — the standard version-control glyph for branching and
// merging, which is literally what a pull request is. Built from thick
// solid strokes and filled dots, rendered at high resolution then
// downsampled per target size, so it stays crisp even at 16px (rendering
// natively at 16px anti-aliased this same shape into a blob).
// Horizontally symmetric about x=64. Vertically, a plain bounding-box
// center undershoots: the two branch nodes at the top put more white pixel
// mass in the upper half than the single trunk node below, so the glyph
// reads as sitting high in the circle even though its bbox is centered.
// Shifted down ~10px so the pixel-mass centroid — not just the bbox — lands
// on (64,64).
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${SOURCE_SIZE}" height="${SOURCE_SIZE}" viewBox="0 0 128 128">
  <circle cx="64" cy="64" r="64" fill="${BRAND_GOLD}" />
  <g fill="none" stroke="#ffffff" stroke-width="14" stroke-linecap="round">
    <path d="M64 106 V74" />
    <path d="M64 74 C64 58, 50 54, 34 42" />
    <path d="M64 74 C64 58, 78 54, 94 42" />
  </g>
  <circle cx="64" cy="106" r="11" fill="#ffffff" />
  <circle cx="34" cy="42" r="11" fill="#ffffff" />
  <circle cx="94" cy="42" r="11" fill="#ffffff" />
</svg>`;

async function main() {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 10, height: 10, deviceScaleFactor: 1 });

  const svgDataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

  await page.setContent(
    `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0"></body></html>`,
    { waitUntil: "load" }
  );

  const results = await page.evaluate(
    async (dataUri, sizes, sourceSize) => {
      const img = new Image();
      img.src = dataUri;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const sourceCanvas = document.createElement("canvas");
      sourceCanvas.width = sourceSize;
      sourceCanvas.height = sourceSize;
      const sctx = sourceCanvas.getContext("2d");
      sctx.drawImage(img, 0, 0, sourceSize, sourceSize);

      const out = {};
      for (const size of sizes) {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(sourceCanvas, 0, 0, size, size);
        out[size] = canvas.toDataURL("image/png");
      }
      return out;
    },
    svgDataUri,
    SIZES,
    SOURCE_SIZE
  );

  for (const size of SIZES) {
    const base64 = results[size].replace(/^data:image\/png;base64,/, "");
    const outPath = path.join(PUBLIC_DIR, `icon${size}.png`);
    fs.writeFileSync(outPath, Buffer.from(base64, "base64"));
    console.log(`-> ${outPath}`);
  }

  await browser.close();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
