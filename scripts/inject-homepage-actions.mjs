import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const uiDir = resolve("UI");
const distDir = resolve(uiDir, "dist");
const indexPath = resolve(distDir, "index.html");
const scriptsToLoad = ["mobile-menu.js", "homepage-actions.js", "agent-builder.js"];
const staticFilesToCopy = [
  [resolve(uiDir, "mobile-menu.js"), resolve(distDir, "mobile-menu.js")],
  [resolve(uiDir, "public", "homepage-actions.js"), resolve(distDir, "homepage-actions.js")],
  [resolve(uiDir, "public", "agent-builder.js"), resolve(distDir, "agent-builder.js")],
  [resolve(uiDir, ".nojekyll"), resolve(distDir, ".nojekyll")],
];

for (const [source, target] of staticFilesToCopy) {
  if (existsSync(source)) {
    copyFileSync(source, target);
  }
}

let html = readFileSync(indexPath, "utf8");

for (const scriptName of scriptsToLoad) {
  if (!html.includes(scriptName)) {
    const scriptTag = `    <script src="./${scriptName}" defer></script>`;
    html = html.replace("  </body>", `${scriptTag}\n  </body>`);
  }
}

writeFileSync(indexPath, html);
