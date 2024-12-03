import inquirer from "inquirer";
import { program } from "commander";
// import { initLocalPackage, initLocalLibrary } from "./init.js";
// import {
//   loadTyzoConfig,
//   loadTyzoLibraryPackage,
//   loadTyzoPackage,
// } from "./config.js";
// import {
//   buildLibrary,
//   buildLocalLibrary,
//   syncLibraryUp,
//   syncPagesUp,
// } from "./syncUp.js";
// import { dev } from "./devServer.js";
// import path from "node:path";
// import { downloadSpace } from "./syncDown.js";
// import { buildWebsite } from "./build.js";
// import { getSpaceUtils } from "./space.js";
// import fs from "node:fs/promises";
// import { syncLibrariesUp } from "./syncUp.js";
// import { downloadPages, uploadPages } from "./pages.js";
// import { loadTyzoPackage } from "./config.js";
// import { downloadAndUnpackLibrary } from "./downloadLibrary.js";

export async function cli() {
  program.name("tyzo");

  // program
  //   .command("init")
  //   .description("Initialize tyzo CMS in the current directory")
  //   .action(async () => {
  //     // await initLocalPackage({ root: process.cwd() });
  //   });

  program
    .command("dev")
    .description("Start the development server to edit content locally")
    .action(async () => {
      // await dev();
    });

  program.parse();
}
