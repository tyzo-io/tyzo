import fs from "node:fs/promises";
import path from "node:path";

export async function addToDotEnv(varname: string, value: string) {
  const dotenv = path.join(process.cwd(), ".env");
  if (
    !(await fs
      .stat(dotenv)
      .then(() => true)
      .catch(() => false))
  ) {
    await fs.writeFile(dotenv, `${value}\n`);
  } else {
    const content = await fs.readFile(dotenv, "utf-8");
    if (!content.includes(varname)) {
      await fs.appendFile(dotenv, `\n${value}\n`);
    }
  }
}
