const root = process.cwd();

import inquirer from "inquirer";
import { program } from "commander";
import { startLocalServer } from "./localServer.js";
import path from "node:path";
import fs from "node:fs/promises";
import { addToDotEnv } from "./dotenv.js";

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
            message: `No tyzo config file found. Do you want to create one at ${configFile}?`,
          },
        ]);
        if (response.configFile) {
          await fs.writeFile(configFile, configTemplate);
          await addToDotEnv(
            "TYZO_API_URL",
            `# This is your local content api. To hit tyzo's CDN, remove this env var and make sure that \`TYZO_SPACE\` is set.\nTYZO_API_URL=http://localhost:3456/api`
          );
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
