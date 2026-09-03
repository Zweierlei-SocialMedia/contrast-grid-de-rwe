import { defineConfig } from "vite";
import autoprefixer from "autoprefixer";

export default defineConfig({
  base: "./",
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
