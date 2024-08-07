import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
// import { libInjectCss } from "vite-plugin-lib-inject-css";
import { resolve } from "path";
import { fileURLToPath } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // libInjectCss(),
    dts({ include: ["src"] }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    lib: {
      entry: [
        resolve(__dirname, "src/index.ts"),
        resolve(__dirname, "src/render.ts"),
      ],
      formats: ["es"],
    },
    rollupOptions: {
      external: ["react", "react/jsx-runtime", "react-dom"],
      input: {
        index: fileURLToPath(new URL("src/index.ts", import.meta.url)),
        render: fileURLToPath(new URL("src/render.ts", import.meta.url)),
        serviceClient: fileURLToPath(
          new URL("src/serviceClient.ts", import.meta.url)
        ),
        Page: fileURLToPath(new URL("src/Page/index.tsx", import.meta.url)),
        Editor: fileURLToPath(new URL("src/Editor/index.tsx", import.meta.url)),
        PageEditor: fileURLToPath(new URL("src/PageEditor.ts", import.meta.url)),
        EmailEditor: fileURLToPath(new URL("src/EmailEditor.ts", import.meta.url)),
        std: fileURLToPath(new URL("src/std/index.tsx", import.meta.url)),
      },

      // Object.fromEntries(
      //   glob.sync("src/**/*.{ts,tsx}").map((file) => [
      //     // The name of the entry point
      //     // lib/nested/foo.ts becomes nested/foo
      //     relative("src", file.slice(0, file.length - extname(file).length)),
      //     // The absolute path to the entry file
      //     // lib/nested/foo.ts becomes /project/lib/nested/foo.ts
      //     fileURLToPath(new URL(file, import.meta.url)),
      //   ])
      // ),
      output: {
        assetFileNames: "assets/[name][extname]",
        entryFileNames: "[name].js",
        // format: "iife",
      },
    },
  },

  // css: {
  //   postcss: {
  //     plugins: [tailwindcss],
  //   },
  // },
});
