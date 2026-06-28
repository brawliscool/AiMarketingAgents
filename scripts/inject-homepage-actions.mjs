import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const indexPath = resolve("dist", "index.html");
const scriptTag = '    <script src="./homepage-actions.js" defer></script>';
const html = readFileSync(indexPath, "utf8");

if (!html.includes("homepage-actions.js")) {
  writeFileSync(indexPath, html.replace("  </body>", `${scriptTag}\n  </body>`));
}
