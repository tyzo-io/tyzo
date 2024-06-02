import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import dts from "vite-plugin-dts";
import { fileURLToPath } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), dts({ include: ["src"] })],
  build: {
    copyPublicDir: false,
    lib: {
      entry: [
        resolve(__dirname, "src/lib.ts"),
        resolve(__dirname, "src/editor.ts"),
        resolve(__dirname, "src/render.ts"),
      ],
      formats: ["es"],
    },
    rollupOptions: {
      external: ["react", "react/jsx-runtime", "react-dom"],
      input: {
        lib: fileURLToPath(new URL("src/lib.ts", import.meta.url)),
        render: fileURLToPath(new URL("src/render.ts", import.meta.url)),
        editor: fileURLToPath(new URL("src/editor.ts", import.meta.url)),
        standardComponents: fileURLToPath(
          new URL("src/standardComponents.ts", import.meta.url)
        ),
        standardInputs: fileURLToPath(
          new URL("src/standardInputs.ts", import.meta.url)
        ),
        "i18n/de": fileURLToPath(new URL("src/i18n/de.ts", import.meta.url)),
      },
    },
  },
});
