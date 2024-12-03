// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import { resolve } from "path";
// import { fileURLToPath } from "node:url";

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [
//     react(),
//     // dts({ include: ["src"] }),
//     // banner2((chunk) => {
//     //   if (chunk.name === 'Editable') {
//     //     return '"use client";';
//     //   }
//     //   return "";
//     // }),
//   ],
//   build: {
//     rollupOptions: {
//       input: {
//         app: "./example/index.html", // default
//       },
//     },
//   },
//   // build: {
//   //   copyPublicDir: false,
//   //   lib: {
//   //     entry: [
//   //       resolve(__dirname, "src/lib.ts"),
//   //       resolve(__dirname, "src/editor.ts"),
//   //       resolve(__dirname, "src/render.ts"),
//   //       resolve(__dirname, "src/css.ts"),
//   //     ],
//   //     formats: ["es", "cjs"],
//   //   },
//   //   rollupOptions: {
//   //     external: ["react", "react-dom", "react/jsx-runtime"],
//   //     input: {
//   //       lib: fileURLToPath(new URL("src/lib.ts", import.meta.url)),
//   //       render: fileURLToPath(new URL("src/render.ts", import.meta.url)),
//   //       editor: fileURLToPath(new URL("src/editor.ts", import.meta.url)),
//   //       css: fileURLToPath(new URL("src/css.ts", import.meta.url)),
//   //       standardComponents: fileURLToPath(
//   //         new URL("src/standardComponents.ts", import.meta.url)
//   //       ),
//   //       standardInputs: fileURLToPath(
//   //         new URL("src/standardInputs.ts", import.meta.url)
//   //       ),
//   //       "i18n/de": fileURLToPath(new URL("src/i18n/de.ts", import.meta.url)),
//   //     },
//   //   },
//   // },
// });
