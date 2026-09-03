import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import autoprefixer from "autoprefixer";
import postcss from "postcss";
import * as sass from "sass";
import nunjucks from "nunjucks";

const root = path.dirname(fileURLToPath(import.meta.url));
const SVG_DIR = path.join(root, "src", "svg");
const SPRITE_FILE = "svg/contrast-grid.svg";
const GRID_SCSS = path.join(
  root,
  "src",
  "components",
  "contrast_grid",
  "contrast_grid.scss",
);

const sassOptions = {
  loadPaths: [path.join(root, "src", "components")],
  silenceDeprecations: [
    "import",
    "global-builtin",
    "slash-div",
    "color-functions",
  ],
};

// The "Copy Grid HTML & CSS" feature copies the grid's markup including its
// <style> block, so the grid stylesheet has to be inlined at build time.
async function compileGridCss() {
  const { css } = sass.compile(GRID_SCSS, sassOptions);
  const result = await postcss([autoprefixer()]).process(css, {
    from: GRID_SCSS,
    map: false,
  });
  return result.css;
}

function buildSprite() {
  const symbols = fs
    .readdirSync(SVG_DIR)
    .filter((file) => file.endsWith(".svg"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(SVG_DIR, file), "utf8");
      const openTag = raw.match(/<svg\b[^>]*>/i)[0];
      const viewBox = openTag.match(/viewBox="([^"]+)"/i);
      const inner = raw
        .slice(raw.indexOf(openTag) + openTag.length, raw.lastIndexOf("</svg>"))
        .trim();
      const id = path.basename(file, ".svg");
      return `<symbol id="${id}"${viewBox ? ` viewBox="${viewBox[1]}"` : ""}>${inner}</symbol>`;
    });

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${symbols.join("")}</svg>`;
}

function nunjucksPlugin() {
  const env = new nunjucks.Environment(
    new nunjucks.FileSystemLoader(
      [path.join(root, "src", "components"), path.join(root, "src")],
      { noCache: true },
    ),
    { autoescape: false },
  );

  return {
    name: "contrast-grid:nunjucks",
    transformIndexHtml: {
      order: "pre",
      async handler(html) {
        return env.renderString(html, {
          contrast_grid_css: await compileGridCss(),
        });
      },
    },
    configureServer(server) {
      server.watcher.add([
        path.join(root, "src", "components"),
        path.join(root, "src", "svg"),
      ]);
      server.watcher.on("change", (file) => {
        if (/\.(njk|svg)$/.test(file) || file === GRID_SCSS) {
          (server.hot ?? server.ws).send({ type: "full-reload" });
        }
      });
    },
  };
}

function svgSpritePlugin() {
  return {
    name: "contrast-grid:svg-sprite",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: SPRITE_FILE,
        source: buildSprite(),
      });
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split("?")[0] !== `/${SPRITE_FILE}`) {
          return next();
        }
        res.setHeader("Content-Type", "image/svg+xml");
        res.end(buildSprite());
      });
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [nunjucksPlugin(), svgSpritePlugin()],
  css: {
    preprocessorOptions: { scss: sassOptions },
    postcss: { plugins: [autoprefixer()] },
  },
  build: {
    outDir: "docs",
    emptyOutDir: true,
  },
});
