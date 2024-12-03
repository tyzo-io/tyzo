import * as esbuild from "esbuild";
import fs from "node:fs/promises";
import path from "node:path";
import { build } from "vite";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import * as ts from "typescript";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await build({
  root: __dirname,
  configFile: false,
  copyPublicDir: false,
  define: {
    "process.env": {},
  },
  plugins: [react(), dts({ include: ["src/components.ts", 'src/editor'] })],
  build: {
    outDir: path.join(__dirname, "dist", "components"),
    lib: {
      entry: path.resolve(__dirname, "src/components.ts"),
      formats: ["es"],
    },
    rollupOptions: {
      external: [
        "react",
        "react/jsx-runtime",
        "@hookform/resolvers",
        "@radix-ui/react-alert-dialog",
        "@radix-ui/react-checkbox",
        "@radix-ui/react-label",
        "@radix-ui/react-select",
        "@radix-ui/react-slot",
        "@tanstack/react-query",
        "@radix-ui/react-switch",
        "@radix-ui/react-progress",
        "@trpc/client",
        "@trpc/react-query",
        "@trpc/server",
        "class-variance-authority",
        "clsx",
        "lucide-react",
        "react-hook-form",
        "react-router-dom",
        "tailwind-merge",
        "zod",
      ],
    },
  },
});

await esbuild.build({
  entryPoints: ["src/content.ts"],
  platform: "node",
  format: "esm",
  target: ["node20.0"],
  outfile: "dist/content.js",
  bundle: true,
  external: ["zod"],
});
await esbuild.build({
  entryPoints: ["src/content.ts"],
  platform: "node",
  format: "cjs",
  target: ["node20.0"],
  outfile: "dist/content.cjs",
  bundle: true,
  external: ["zod"],
});


function compileTypes(fileNames, options) {
  // Create a Program with an in-memory emit
  const createdFiles = {};
  const host = ts.createCompilerHost(options);
  host.writeFile = (fileName, contents) => (createdFiles[fileName] = contents);

  // Prepare and emit the d.ts files
  const program = ts.createProgram(fileNames, options, host);
  program.emit();

  Object.keys(createdFiles).forEach((fileName) => {
    const file = createdFiles[fileName];
    const target = fileName.split("/").pop();
    fs.writeFile(path.join("dist", target), file);
  });
}

compileTypes(["src/content.ts"], {
  allowJs: true,
  declaration: true,
  emitDeclarationOnly: true,
});

// await build({
//   root: __dirname,
//   configFile: false,
//   mode: "development",
//   define: {
//     "process.env": {},
//   },
//   build: {
//     outDir: path.join(__dirname, "dist"),
//     rollupOptions: {
//       // input: indexHtmlTargetPath,
//       input: path.resolve(__dirname, "index.html"),
//     },
//   },
// });

// const files = [
//   "src/index.ts",
//   "src/cli.ts",
//   "src/localServer.ts",
// ];

// for (const file of files) {
//   await esbuild.build({
//     entryPoints: [file],
//     platform: "node",
//     format: "esm",
//     target: ["node22.0"],
//     outfile: file.replace("src/", "dist/").replace(".ts", ".js"),
//   });
// }

// await fs.copyFile("index.html", "dist/index.html");
// // const copy = [
// //   // "index.html",
// //   // "src/dev.tsx"
// // ];
// // for (const file of copy) {
// //   await fs.copyFile(file, file.replace("src/", "dist/"));
// // }
// // await fs.copyFile("dist/src/index.html", "dist/index.html");
// console.log("done");
