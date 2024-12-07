#!/usr/bin/env -S npx tsx

import inquirer from "inquirer";
import { program } from "commander";
import { startLocalServer } from "./localServer.js";
import path from "node:path";
import fs from "node:fs/promises";

const configTemplate = `
export const collections = {
  // place your collections here
};

export const globals = {
  // place your globals here
};

`;

export async function cli() {
  program.name("tyzo");

  program
    .command("dev")
    .description("Start the development server to edit content locally")
    .option("-c, --config <configFile>", "Path to tyzo config file")
    .option("-d, --content <contentDir>", "Path to content dir")
    .action(async (options) => {
      const root = process.cwd();
      const defaultConfigFile = path.join(root, "src", "tyzo-config.ts");
      let configFile = options.config ?? defaultConfigFile;
      if (
        !(await fs
          .access(configFile)
          .then(() => true)
          .catch(() => false))
      ) {
        const response = await inquirer.prompt([
          {
            type: "confirm",
            name: "configFile",
            message: "No tyzo config file found. Do you want to create one?",
          },
        ]);
        if (response.configFile) {
          const configFile = path.join(root, "src", "tyzo-config.ts");
          await fs.writeFile(configFile, configTemplate);
        } else {
          console.log("No tyzo config file found, exiting.");
          process.exit(1);
        }
      }
      startLocalServer({
        configFile: configFile,
        contentDir: options.content ?? path.join(root, "content"),
      });
    });

  program.parse(process.argv);
}

cli();
