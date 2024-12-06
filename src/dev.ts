import dotenv from "dotenv";
dotenv.config();

import { createServer } from "vite";
import { startLocalServer } from "./localServer";
import path from "node:path";

async function startExample() {
  // const currentDir = process.cwd();
  // const spacesUrl = process.env.TYZO_SPACES_API_URL ?? "https://app.tyzo.io";
  // const tyzoPackage = await loadTyzoPackage({
  //   root: currentDir,
  // });
  // if (!tyzoPackage.tyzoPackage) {
  //   throw new Error("No tyzo package found");
  // }
  const server = await createServer({
    // root: currentDir,
    root: path.join(__dirname, ".."),
    configFile: false,
    mode: "development",
    define: {
      "process.env": {
        REMOTE_TYZO_URL: process.env.REMOTE_TYZO_URL ?? "http://localhost:8787",
        TYZO_AUTH_URL: process.env.TYZO_AUTH_URL ?? "http://localhost:5173",
        TYZO_SPACE: process.env.TYZO_SPACE,
        // TYZO_ADMIN_URL: process.env.TYZO_ADMIN_URL,
        // TYZO_LIBRARIES_URL: process.env.TYZO_LIBRARIES_URL,
        // TYZO_SPACES_API_URL: spacesUrl.replace(
        //   "{}",
        //   tyzoPackage.tyzoPackage.spaceSlug
        // ),
      },
    },
    // build: {
    //   rollupOptions: {
    //     // input: indexHtmlTargetPath,
    //     input: path.join(__dirname, "..", "example", "index.html"),
    //   },
    // },
    // resolve: {
    //   // preserveSymlinks: true,
    //   alias: [
    //     {
    //       find: "@/tyzo.config",
    //       replacement: indexFilePath,
    //     },
    //   ],
    // },
    server: {
      open: "example/index.html",
      port: 3455,
    },
  });

  await server.listen();
  server.printUrls();
  // server.bindCLIShortcuts({ print: true });
  // server.openBrowser();
}

async function startEditor() {
  const server = await createServer({
    // root: currentDir,
    // root: path.join(__dirname, ".."),
    configFile: false,
    mode: "development",
    define: {
      "process.env": {
        // TYZO_ADMIN_URL: process.env.TYZO_ADMIN_URL,
        // TYZO_LIBRARIES_URL: process.env.TYZO_LIBRARIES_URL,
        // TYZO_SPACES_API_URL: spacesUrl.replace(
        //   "{}",
        //   tyzoPackage.tyzoPackage.spaceSlug
        // ),
      },
    },
    // build: {
    //   rollupOptions: {
    //     // input: indexHtmlTargetPath,
    //     input: path.join(__dirname, "..", "example", "index.html"),
    //   },
    // },
    // resolve: {
    //   // preserveSymlinks: true,
    //   alias: [
    //     {
    //       find: "@/tyzo.config",
    //       replacement: indexFilePath,
    //     },
    //   ],
    // },
    server: {
      // open: "src/index.html",
      port: 3457,
    },
  });

  await server.listen();
  server.printUrls();
  // server.bindCLIShortcuts({ print: true });
  // server.openBrowser();
}

startLocalServer({
  configFile: "example/src/config.ts",
  contentDir: "example/content",
});
startExample();
startEditor();
