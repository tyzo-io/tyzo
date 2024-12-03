import fs from "node:fs/promises";
import path from "node:path";
import { createServer, ViteDevServer } from "vite";
import { fileURLToPath } from "url";
import express from "express";
import "express-async-errors";
import cors from "cors";
import { LocalApi } from "./localApi";
import { managementApiClient } from "./apiClient";
import {
  serializeCollection,
  SerializedCollection,
  SerializedGlobal,
  serializeGlobal,
} from "./schemas";

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

// Sync status tracking
export interface SyncStatus {
  inProgress: boolean;
  type: "up" | "down" | null;
  progress: {
    total: number;
    current: number;
    phase: string;
  };
  error?: string;
}

let currentSyncStatus: SyncStatus = {
  inProgress: false,
  type: null,
  progress: {
    total: 0,
    current: 0,
    phase: "",
  },
};

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

  function getRemoteApiClient(token: string) {
    const remoteBaseUrl = process.env.REMOTE_TYZO_URL ?? "https://api.tyzo.io";
    const space = process.env.TYZO_SPACE;
    const remoteUrl = `${remoteBaseUrl}/content/${space}`;
    console.log("Remote API URL:", remoteUrl);
    const remoteApi = managementApiClient({ API_URL: remoteUrl, token });
    return remoteApi;
  }

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Sync status endpoint
  app.get("/api/sync/status", (req, res) => {
    res.json(currentSyncStatus);
  });

  // Sync to remote endpoint
  app.post("/api/sync/up", async (req, res) => {
    if (currentSyncStatus.inProgress) {
      res.status(409).json({
        error: `Sync already in progress (${currentSyncStatus.type})`,
      });
      return;
    }

    const { schema, content, assets, stage, token } = req.body;
    if (!token) {
      res.status(400).json({
        error: "Must specify a token",
      });
      return;
    }
    if (!stage) {
      res.status(400).json({
        error: "Must specify a stage",
      });
      return;
    }
    if (!schema && !content && !assets) {
      res.status(400).json({
        error: "Must specify at least one of: schema, content, assets",
      });
      return;
    }

    currentSyncStatus = {
      inProgress: true,
      type: "up",
      progress: {
        total: 0,
        current: 0,
        phase: "Starting sync to remote...",
      },
    };

    try {
      const remoteApi = getRemoteApiClient(token);
      const collections = await api.getCollections();
      const globals = await api.getGlobals();

      // const otherCollections = collections.filter(c => c).reduce((acc, c) => {
      //   acc[c.name] = serializeCollection(c);
      //   return acc;
      // }, {} as Record<string, SerializedCollection>),

      let total = 0;
      let current = 0;
      if (schema) {
        total += 1;
        currentSyncStatus.progress = {
          total,
          current,
          phase: "Syncing schema...",
        };

        const res = await remoteApi.updateSchema({
          stage,
          collections: collections.reduce((acc, c) => {
            acc[c.name] = serializeCollection(c);
            return acc;
          }, {} as Record<string, SerializedCollection>),
          globals: globals.reduce((acc, g) => {
            acc[g.name] = serializeGlobal(g);
            return acc;
          }, {} as Record<string, SerializedGlobal>),
        });
        console.log(JSON.stringify(res, null, 2));

        currentSyncStatus.progress.current++;
      }

      if (content) {
        total += globals.length;
        for (const collection of collections) {
          const { entries } = await api.getEntries(collection.name);
          total += entries.length;
          currentSyncStatus.progress = {
            total,
            current,
            phase: "Syncing content...",
          };
          for (const entry of entries) {
            await remoteApi.setEntry(
              collection.name,
              (entry as Record<string | number | symbol, any>)[
                collection.idField
              ],
              entry
            );
            currentSyncStatus.progress.current++;
          }
        }

        for (const global of globals) {
          const value = await api.getGlobalValue(global.name);
          if (value) {
            await remoteApi.setGlobalValue(global.name, value);
            currentSyncStatus.progress.current++;
          }
        }
      }

      currentSyncStatus = {
        inProgress: false,
        type: null,
        progress: {
          total,
          current,
          phase: "Sync completed successfully",
        },
      };

      res.json({ success: true });
    } catch (error) {
      console.error(error);
      currentSyncStatus = {
        inProgress: false,
        type: null,
        progress: {
          total: 2,
          current: 0,
          phase: "Sync failed",
        },
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };

      res.status(500).json({
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  });

  // // Sync from remote endpoint
  // app.post("/api/sync/down", async (req, res) => {
  //   if (currentSyncStatus.inProgress) {
  //     res.status(409).json({
  //       error: `Sync already in progress (${currentSyncStatus.type})`
  //     });
  //     return
  //   }

  //   const { schema, content } = req.body;
  //   if (!schema && !content) {
  //     res.status(400).json({
  //       error: "Must specify at least one of: schema, content"
  //     });
  //     return
  //   }

  //   currentSyncStatus = {
  //     inProgress: true,
  //     type: 'down',
  //     progress: {
  //       total: 0,
  //       current: 0,
  //       phase: 'Starting sync from remote...',
  //     },
  //   };

  //   try {
  //     const remoteApi = getRemoteApiClient();

  //     if (schema) {
  //       currentSyncStatus.progress = {
  //         total: 2,
  //         current: 0,
  //         phase: 'Syncing schema...',
  //       };

  //       const remoteSchema = await remoteApi.getSchema();

  //       // Update local schema file
  //       const configPath = path.join(process.cwd(), options?.configFile ?? "config.ts");
  //       const configContent = await fs.readFile(configPath, 'utf-8');

  //       // TODO: Update schema in config file
  //       // This part needs to be implemented based on how your schema is stored
  //       // You might want to create a separate function for this

  //       currentSyncStatus.progress.current = 1;
  //     }

  //     if (content) {
  //       currentSyncStatus.progress = {
  //         total: 2,
  //         current: schema ? 1 : 0,
  //         phase: 'Syncing content...',
  //       };

  //       const remoteSchema = await remoteApi.getSchema();

  //       // Sync collections
  //       for (const collection of remoteSchema.collections) {
  //         const entries = await remoteApi.getEntries(collection.name);
  //         await api.setEntries(collection.name, entries);
  //       }

  //       // Sync globals
  //       for (const global of remoteSchema.globals) {
  //         const value = await remoteApi.getGlobalValue(global.name);
  //         if (value) {
  //           await api.setGlobalValue(global.name, value);
  //         }
  //       }

  //       currentSyncStatus.progress.current = 2;
  //     }

  //     currentSyncStatus = {
  //       inProgress: false,
  //       type: null,
  //       progress: {
  //         total: 2,
  //         current: 2,
  //         phase: 'Sync completed successfully',
  //       },
  //     };

  //     res.json({ success: true });
  //   } catch (error) {
  //     currentSyncStatus = {
  //       inProgress: false,
  //       type: null,
  //       progress: {
  //         total: 2,
  //         current: 0,
  //         phase: 'Sync failed',
  //       },
  //       error: error instanceof Error ? error.message : 'Unknown error occurred',
  //     };

  //     res.status(500).json({
  //       error: error instanceof Error ? error.message : 'Unknown error occurred'
  //     });
  //   }
  // });

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
      await fs.writeFile(dotenv, `TYZO_SPACE=${space}\n`, {
        mode: "a",
      });
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
