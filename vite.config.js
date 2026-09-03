import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import autoprefixer from "autoprefixer";
import postcss from "postcss";
import * as sass from "sass";
import nunjucks from "nunjucks";

const require = createRequire(import.meta.url);
const root = path.dirname(fileURLToPath(import.meta.url));
const GRID_SCSS = path.join(
  root,
  "src",
  "components",
  "contrast_grid",
  "contrast_grid.scss",
);

// Maps the names used in templates to their source file. Everything but the
// brand mark comes from the bootstrap-icons package.
const ICONS = {
  "circle-o-notch": "bootstrap-icons/icons/arrow-repeat.svg",
  clipboard: "bootstrap-icons/icons/clipboard.svg",
  close: "bootstrap-icons/icons/x-lg.svg",
  github: "bootstrap-icons/icons/github.svg",
  grip: "bootstrap-icons/icons/grip-vertical.svg",
  "grip-horizontal": "bootstrap-icons/icons/grip-horizontal.svg",
  twitter: "bootstrap-icons/icons/twitter-x.svg",
  "eightshapes-mark": path.join(root, "src", "brand", "eightshapes-mark.svg"),
};

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

function renderIcon(name, className) {
  const source = ICONS[name];
  if (!source) {
    throw new Error(`Unknown icon "${name}"`);
  }

  const file = path.isAbsolute(source) ? source : require.resolve(source);
  const svg = fs.readFileSync(file, "utf8").trim();
  const classes = [`icon-${name}`, className].filter(Boolean).join(" ");

  return svg
    .replace(/<title>[\s\S]*?<\/title>/g, "")
    .replace(/<svg\b[^>]*>/, (openTag) => {
      const viewBox = openTag.match(/viewBox="[^"]*"/)?.[0] ?? "";
      return `<svg xmlns="http://www.w3.org/2000/svg" ${viewBox} class="${classes}" fill="currentColor" aria-hidden="true" focusable="false">`;
    });
}

function nunjucksPlugin() {
  const env = new nunjucks.Environment(
    new nunjucks.FileSystemLoader(
      [path.join(root, "src", "components"), path.join(root, "src")],
      { noCache: true },
    ),
    { autoescape: false },
  );

  env.addGlobal("icon", (...args) => {
    const kwargs = args[args.length - 1] ?? {};
    return renderIcon(kwargs.icon_name, kwargs.class);
  });

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
        path.join(root, "src", "brand"),
      ]);
      server.watcher.on("change", (file) => {
        if (/\.(njk|svg)$/.test(file) || file === GRID_SCSS) {
          (server.hot ?? server.ws).send({ type: "full-reload" });
        }
      });
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [nunjucksPlugin()],
  css: {
    preprocessorOptions: { scss: sassOptions },
    postcss: { plugins: [autoprefixer()] },
  },
  build: {
    outDir: "docs",
    emptyOutDir: true,
  },
});
