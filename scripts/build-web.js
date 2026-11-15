// Builds the static site into dist/.
//
//   node scripts/build-web.js  ->  dist/index.html, dist/app.js, dist/satark-standalone.html
//
// satark-standalone.html is one self-contained file that works offline.

import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync, existsSync, cpSync, rmSync } from "node:fs";

const root = new URL("../", import.meta.url);
mkdirSync(new URL("dist/", root), { recursive: true });

const result = await build({
  entryPoints: [new URL("web/app.js", root).pathname],
  bundle: true,
  format: "esm",
  minify: true,
  target: "es2020",
  write: false,
  loader: { ".json": "json" },
});
const js = result.outputFiles[0].text;
writeFileSync(new URL("dist/app.js", root), js);

const html = readFileSync(new URL("web/index.html", root), "utf8");
writeFileSync(new URL("dist/index.html", root), html);
const inline = html.replace('<script type="module" src="./app.js"></script>', () => `<script type="module">${js.replace(/<\/script/g, "<\\/script")}</script>`);
writeFileSync(new URL("dist/satark-standalone.html", root), inline);
// Recorded voices, if generated with scripts/voices.js.
rmSync(new URL("dist/audio", root), { recursive: true, force: true });
if (existsSync(new URL("web/audio/manifest.json", root))) {
  cpSync(new URL("web/audio", root), new URL("dist/audio", root), { recursive: true });
  console.log("copied recorded voices to dist/audio");
}
console.log(`dist/app.js ${(js.length / 1024).toFixed(0)} KB, standalone ${(inline.length / 1024).toFixed(0)} KB`);
