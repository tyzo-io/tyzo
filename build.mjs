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
  plugins: [react(), dts({ include: ["src/components.ts", "src/editor"] })],
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
        "@radix-ui/react-avatar",
        "@radix-ui/react-checkbox",
        "@radix-ui/react-dialog",
        "@radix-ui/react-dropdown-menu",
        "@radix-ui/react-label",
        "@radix-ui/react-popover",
        "@radix-ui/react-progress",
        "@radix-ui/react-select",
        "@radix-ui/react-slot",
        "@radix-ui/react-switch",
        "@radix-ui/react-tabs",
        "@tanstack/react-query",
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
  entryPoints: ["src/react.ts"],
  format: "esm",
  // target: ["node20.0"],
  outfile: "dist/esm/react.js",
});
await esbuild.build({
  entryPoints: ["src/react.ts"],
  format: "cjs",
  // target: ["node20.0"],
  outfile: "dist/cjs/react.cjs",
});

// await esbuild.build({
//   entryPoints: ["src/content.ts"],
//   platform: "node",
//   format: "esm",
//   target: ["node20.0"],
//   outfile: "dist/content.js",
//   bundle: true,
//   external: ["zod"],
// });
// await esbuild.build({
//   entryPoints: ["src/content.ts"],
//   platform: "node",
//   format: "cjs",
//   target: ["node20.0"],
//   outfile: "dist/content.cjs",
//   bundle: true,
//   external: ["zod"],
// });

const files = [
  "src/cli.ts",
  "src/localServer.ts",
  "src/localApi.ts",
  "src/schemas.ts",
  "src/apiClient/index.ts",
  "src/apiClient/management.ts",
  "src/apiClient/values.ts",
  "src/apiClient/assetUrls.ts",
  "src/sync/index.ts",
  "src/sync/syncDown.ts",
  "src/sync/syncUp.ts",
  "src/sync/urls.ts",
  "src/sync/util.ts",
  "src/dotenv.ts",
  "src/applyFilters.ts",
  "src/content.ts",
  "src/filters.ts",
  "src/sort.ts",
  "src/validate.ts",
  "src/apiClient/values.ts",
];
for (const file of files) {
  await esbuild.build({
    entryPoints: [file],
    platform: "node",
    format: "cjs",
    target: ["node20.0"],
    outfile: file.replace("src/", "dist/cjs/").replace(".ts", ".js"),
  });
  await esbuild.build({
    entryPoints: [file],
    platform: "node",
    format: "esm",
    target: ["node20.0"],
    outfile: file.replace("src/", "dist/esm/").replace(".ts", ".js"),
  });
}

await fs.chmod("dist/cjs/cli.js", 0o755);
await fs.chmod("dist/esm/cli.js", 0o755);

// await fs.cp("./index.html", "dist/index.html");
// await fs.cp("./src/editorClient.tsx", "dist/src/editorClient.tsx");
// await fs.cp("./src/content.ts", "dist/src/content.ts");
// await fs.cp("./src/types.ts", "dist/src/types.ts");
// await fs.cp("./src/validate.ts", "dist/src/validate.ts");
// await fs.cp("./src/sort.ts", "dist/src/sort.ts");
// await fs.cp("./src/filters.ts", "dist/src/filters.ts");
// await fs.cp("./src/schemas.ts", "dist/src/schemas.ts");
// await fs.cp("./src/editor", "dist/src/editor", { recursive: true });
// await fs.cp("./src/apiClient", "dist/src/apiClient", { recursive: true });

await build({
  root: __dirname,
  configFile: false,
  copyPublicDir: false,
  define: {
    "process.env": {},
  },
  plugins: [react(), 
    // dts({ include: ["src/editorClient.tsx", "src/editor"] })
  ],
  build: {
    outDir: path.join(__dirname, "dist", "editorClient"),
    // lib: {
    //   entry: path.resolve(__dirname, "src/components.ts"),
    //   formats: ["es"],
    // },
    // rollupOptions: {
    //   external: [
    //     "react",
    //     "react/jsx-runtime",
    //     "@hookform/resolvers",
    //     "@radix-ui/react-alert-dialog",
    //     "@radix-ui/react-avatar",
    //     "@radix-ui/react-checkbox",
    //     "@radix-ui/react-dialog",
    //     "@radix-ui/react-dropdown-menu",
    //     "@radix-ui/react-label",
    //     "@radix-ui/react-popover",
    //     "@radix-ui/react-progress",
    //     "@radix-ui/react-select",
    //     "@radix-ui/react-slot",
    //     "@radix-ui/react-switch",
    //     "@radix-ui/react-tabs",
    //     "@tanstack/react-query",
    //     "@trpc/client",
    //     "@trpc/react-query",
    //     "@trpc/server",
    //     "class-variance-authority",
    //     "clsx",
    //     "lucide-react",
    //     "react-hook-form",
    //     "react-router-dom",
    //     "tailwind-merge",
    //     "zod",
    //   ],
    // },
  },
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

compileTypes(["src/content.ts", "src/react.ts"], {
  strict: true,
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
