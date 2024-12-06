import fs from "node:fs/promises";
import path from "node:path";
import { createServer, ViteDevServer } from "vite";
import { fileURLToPath } from "url";
import express from "express";
import "express-async-errors";
import cors from "cors";
import { LocalApi } from "./localApi";
import { serializeCollection, serializeGlobal } from "./schemas";
import { syncRoutesFactory } from "./sync";

// @ts-expect-error
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let vite: ViteDevServer;
async function startViteServer() {
  if (vite) {
    vite.close();
  }
  vite = await createServer({
    root: path.join(__dirname, ".."),
    define: {
      "process.env": {
        REMOTE_TYZO_URL: process.env.REMOTE_TYZO_URL,
        TYZO_SPACE: process.env.TYZO_SPACE,
        TYZO_AUTH_URL: process.env.TYZO_AUTH_URL,
      },
    },
    server: {
      port: 3000,
    },
  });
  await vite.listen();
}

export async function startLocalServer(options?: {
  configFile?: string;
  contentDir?: string;
}) {
  const app = express();
  const port = 3456;

  const currentDir = process.cwd();
  const config = require(path.join(
    currentDir,
    options?.configFile ?? "config.ts"
  ));

  // Create LocalApi instance with collections and globals
  const api = new LocalApi({
    contentDir: path.join(process.cwd(), options?.contentDir ?? "src/content"),
    collections: Object.values(config.collections ?? {}),
    globals: Object.values(config.globals ?? {}),
  });

  // Middleware
  app.use(cors());
  app.use(express.json());


  const syncRoutes = syncRoutesFactory(api);

  // Sync status endpoint
  app.get("/api/sync/status", (req, res) => {
    res.json(syncRoutes.currentSyncStatus());
  });

  // Sync to remote endpoint
  app.post("/api/sync/up", syncRoutes.syncUp);

  app.post("/api/save-space", async (req, res) => {
    // locate .env file
    const dotenv = path.join(process.cwd(), ".env");
    const space = req.body.space;
    if (
      !(await fs
        .stat(dotenv)
        .then(() => true)
        .catch(() => false))
    ) {
      await fs.writeFile(dotenv, `TYZO_SPACE=${space}\n`);
    } else {
      await fs.appendFile(dotenv, `\nTYZO_SPACE=${space}\n`);
    }
    process.env.TYZO_SPACE = space;
    await startViteServer();
    res.status(201).json({ success: true });
  });

  // Schema
  app.get("/api/schema", async (req, res) => {
    const collections = await api.getCollections();
    const globals = await api.getGlobals();
    res.json({
      collections: collections
        .map((collection) =>
          serializeCollection(
            collection,
            collections
              .filter((c) => c !== collection)
              .reduce((all, c) => ({ ...all, [c.name]: c.schema }), {})
          )
        )
        .reduce((all, c) => ({ ...all, [c.name]: c }), {}),
      globals: globals
        .map((global) => serializeGlobal(global))
        .reduce((all, g) => ({ ...all, [g.name]: g }), {}),
    });
  });

  // Collections
  app.get("/api/collections/:collection/entries", async (req, res) => {
    const limit = Number(req.query.limit ?? 1000);
    const offset = Number(req.query.offset ?? 0);
    const filters = JSON.parse((req.query.filters as string) ?? "{}");
    const sort = JSON.parse((req.query.sort as string) ?? "[]");
    const includeCount = Boolean(req.query.includeCount);

    const entries = await api.getEntries(req.params.collection, {
      includeCount,
      limit,
      offset,
      filters,
      sort,
    });
    res.json(entries);
  });

  app.get("/api/collections/:collection/entries/:id", async (req, res) => {
    const entry = await api.getEntry(req.params.collection, req.params.id);
    if (!entry) {
      res.status(404).json({ error: "Entry not found" });
      return;
    }
    res.json({ entry });
  });

  app.put("/api/collections/:collection/entries/:id", async (req, res) => {
    await api.setEntry(req.params.collection, req.params.id, req.body);
    res.status(201).json({ success: true });
  });

  app.delete("/api/collections/:collection/entries/:id", async (req, res) => {
    const success = await api.deleteEntry(req.params.collection, req.params.id);
    if (!success) {
      res.status(404).json({ error: "Entry not found" });
      return;
    }
    res.json({ success: true });
  });

  // Globals
  app.get("/api/globals/:global", async (req, res) => {
    const global = await api.getGlobal(req.params.global);
    res.json({ global: global ? serializeGlobal(global) : null });
  });

  app.get("/api/globals/:global/value", async (req, res) => {
    const global = await api.getGlobalValue(req.params.global);
    if (!global) {
      res.status(404).json({ error: "Global not found" });
      return;
    }
    res.json({ global });
  });

  app.put("/api/globals/:global/value", async (req, res) => {
    await api.setGlobalValue(req.params.global, req.body);
    res.status(201).json({ success: true });
  });

  // Assets
  app.get("/api/assets", async (req, res) => {
    const assets = await api.listAssets();
    res.json({ assets });
  });

  app.get("/api/assets/*", async (req, res) => {
    const { width, height, format, quality } = req.query;
    const key = req.path.substring("/api/assets/".length);
    const asset = await api.getAsset(key, {
      width: width ? Number(width) : undefined,
      height: height ? Number(height) : undefined,
      format: format ? (format as "webp") : undefined,
      quality: quality ? Number(quality) : undefined,
    });
    if (!asset) {
      res.status(404).json({ error: "Asset not found" });
      return;
    }
    res
      .status(200)
      .header("Content-Type", asset.contentType ?? "application/octet-stream")
      .write(asset.data);
  });

  const readBodyAsBuffer = (req: express.Request): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
      let body: Buffer[] = [];
      req.on("data", (chunk) => {
        body.push(chunk);
      });
      req.on("end", () => {
        resolve(Buffer.concat(body));
      });
      req.on("error", (err) => {
        reject(err);
      });
    });
  };

  app.put("/api/assets/:filename", async (req, res) => {
    const file = await readBodyAsBuffer(req);
    const contentType = req.header("Content-Type");
    await api.uploadAsset(file, {
      filename: req.params.filename,
      contentType,
    });
    res.status(201).json({ success: true });
  });

  app.delete("/api/assets/:filename", async (req, res) => {
    const success = await api.deleteAsset(req.params.filename);
    if (!success) {
      res.status(404).json({ error: "Asset not found" });
      return;
    }
    res.json({ success: true });
  });

  // Error handling
  app.use(
    (
      err: Error,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  );

  // Start server
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });

  await startViteServer();
}
