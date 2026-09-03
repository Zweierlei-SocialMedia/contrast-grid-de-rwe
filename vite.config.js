import { defineConfig } from "vite";
import autoprefixer from "autoprefixer";

// Short aliases for frequently used palettes. The query string is the same one
// the app writes to the address bar, so a shortcut can be created by copying
// the current URL.
const SHORTCUTS = {
  rwe: "/?version=1.1.0&background-colors=&foreground-colors=%23000000%2C+Black%0A%23FFFFFF%2C+White%0A%231D4477%2C+Blue%0A%2300B1EB%2C+Energy+Blue%0A%2300A19F%2C+Energy+dark+green%0A%233ED8C3%2C+energy+light+green%0A%23005E65%2C+rwe-accent-green%0A%235AB88F%2C+rwe-accent-light-green%0A%23EF7D00%2C+accent-orange%0A%23FFCC00%2C+rwe-accent-yellow%0A%23B61F34%2C+accent-dark-red%0A%23E7343F%2C+accent-light-red%0A%2352555C%2C+accent-dark-gray%0A%23ADAFB1%2C+accent-light-gray%0A%23E8E8E4%2C+sand%0A%23557399%2C+Blue1%0A%238EA1BB%2C+Blue2%0A%23C6D0DD%2C+Blue3%0A%2340C5F0%2C+Energy+Blue1%0A%2380D8F5%2C+Energy+Blue2%0A%23BFECFA%2C+Energy+Blue3%0A%2340B9B7%2C+Energy+dark+green1%0A%2380D0CF%2C+Energy+dark+green2%0A%23BFE8E7%2C+Energy+dark+green3%0A%236EE2D2%2C+energy+light+green1%0A%239FECE1%2C+energy+light+green2%0A%23CFF5F0%2C+energy+light+green3%0A%23EEEEEB%2C+sand1%0A%23F4F4F1%2C+sand2%0A%23F9F9F8%2C+sand3%0A&es-color-form__tile-size=compact&es-color-form__show-contrast=aaa&es-color-form__show-contrast=aa&es-color-form__show-contrast=aa18&es-color-form__show-contrast=dnp",
};

function redirectPage(target) {
  const attr = target.replace(/&/g, "&amp;");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Contrast Grid</title>
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=${attr}">
<script>location.replace(${JSON.stringify(target)});</script>
</head>
<body><a href="${attr}">Continue to the contrast grid</a></body>
</html>
`;
}

function shortcutsPlugin() {
  // Runs ahead of Vite's static and history-fallback middleware.
  const middleware = (req, res, next) => {
    const slug = (req.url ?? "").split("?")[0].replace(/^\/|\/$/g, "");
    const target = SHORTCUTS[slug];

    if (!target) {
      return next();
    }

    res.writeHead(302, { Location: target });
    res.end();
  };

  return {
    name: "contrast-grid:shortcuts",
    // Braces matter: `middlewares.use()` returns the connect app, and Vite
    // would run a returned function as a post-hook.
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
    generateBundle() {
      for (const [slug, target] of Object.entries(SHORTCUTS)) {
        this.emitFile({
          type: "asset",
          fileName: `${slug}/index.html`,
          source: redirectPage(`..${target}`),
        });
      }
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [shortcutsPlugin()],
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: ["src/components"],
        silenceDeprecations: [
          "import",
          "global-builtin",
          "slash-div",
          "color-functions",
        ],
      },
    },
    postcss: { plugins: [autoprefixer()] },
  },
  build: {
    outDir: "docs",
    emptyOutDir: true,
  },
});
