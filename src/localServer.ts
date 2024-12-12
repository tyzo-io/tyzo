// import tsx from "tsx/cjs/api";
// @ts-expect-error
import tsxEsm from 'tsx/esm/api'
import fs from "node:fs/promises";
import path from "node:path";
import { type ViteDevServer } from "vite";
import { fileURLToPath } from "url";
import express from "express";
import "express-async-errors";
import cors from "cors";
import { LocalApi } from "./localApi.js";
import { serializeCollection, serializeGlobal } from "./schemas.js";
import { syncRoutesFactory } from "./sync.js";
import chokidar from "chokidar";
import { addToDotEnv } from './dotenv.js';

if (typeof __filename === "undefined") {
  // @ts-expect-error
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  globalThis.__dirname = __dirname;
}

let vite: ViteDevServer;
async function startViteServer(root: string) {
  const { createServer } = await import("vite");
  if (vite) {
    vite.close();
  }
  vite = await createServer({
    root,
    define: {
      "process.env": {
        REMOTE_TYZO_URL: process.env.REMOTE_TYZO_URL,
        TYZO_SPACE: process.env.TYZO_SPACE,
        TYZO_AUTH_URL: process.env.TYZO_AUTH_URL,
      },
    },
    server: {
      port: 7120,
    },
  });
  await vite.listen();
  console.log("Started local UI at http://localhost:7120");
}

export async function startLocalServer(options?: {
  configFile?: string;
  contentDir?: string;
  viteRoot?: string;
  useViteServer?: boolean;
}) {
  const app = express();
  const port = 3456;

  const currentDir = process.cwd();
  const configPath = path.join(currentDir, options?.configFile ?? "config.ts");

  async function loadConfig() {
    const api = tsxEsm.register({
      namespace: Date.now().toString(),
    });

    const loaded = await api.import(configPath, __filename);
    api.unregister();

    // const api = tsx.register({
    //   namespace: Date.now().toString(),
    // });
    // console.log(api.require.cache);
    // console.log(
    //   tsx.require.cache?.[tsx.require.resolve(configPath, __filename)]
    // );
    // console.log(
    //   api.require.cache?.[tsx.require.resolve(configPath, __filename)]
    // );

    // const config = api.require(configPath, __filename);
    // console.log(api.require.cache);
    // api.unregister();
    return loaded;
  }

  let config = await loadConfig();

  // console.log("watching", currentDir);
  const extensions = [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "astro",
    "svelte",
    "vue",
  ];
  chokidar
    .watch(currentDir, {
      ignored: (path, stats) => {
        if (path.includes("node_modules")) {
          return true;
        }
        if (!stats) {
          return false;
        }
        if (stats?.isDirectory()) {
          return false;
        }
        const ignore = !extensions.includes(path.split(".").pop() ?? "");
        return ignore;
      },
      ignoreInitial: true,
    })
    .on("all", async () => {
      // console.log("file changed");
      const newConfig = await loadConfig();
      // delete require.cache[require.resolve(configPath)];
      // const newConfig = require(configPath);
      config = newConfig;
      api.setConfig({
        collections: Object.values(config.collections ?? {}),
        globals: Object.values(config.globals ?? {}),
      });
    });

  // Create LocalApi instance with collections and globals
  const api = new LocalApi({
    contentDir:
      options?.contentDir && path.isAbsolute(options?.contentDir)
        ? options?.contentDir
        : path.join(process.cwd(), options?.contentDir ?? "src/content"),
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

  app.post("/api/sync/download-asset", async (req, res) => {
    const { key, stage, token } = req.body;
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
    await syncRoutes.downloadAsset(stage, token, key);
    res.status(201).json({ success: true });
  });

  app.get("/api/space", async (req, res) => {
    // locate .env file
    const dotenv = path.join(process.cwd(), ".env");
    if (
      !(await fs
        .stat(dotenv)
        .then(() => true)
        .catch(() => false))
    ) {
      const content = await fs.readFile(dotenv, "utf-8");
      const spaceMatch = content.match(/TYZO_SPACE=([^\\n]+)/)?.[1];
      if (spaceMatch) {
        process.env.TYZO_SPACE = spaceMatch;
        res.status(200).json({ space: spaceMatch });
        return;
      }
    }
    res.status(201).json({ space: null });
  });

  app.post("/api/space", async (req, res) => {
    // locate .env file
    const space = req.body.space;
    await addToDotEnv("TYZO_SPACE", `TYZO_SPACE=${space}`);
    process.env.TYZO_SPACE = space;
    if (options?.useViteServer) {
      await startViteServer(options?.viteRoot ?? __dirname);
    }
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
    const include = JSON.parse((req.query.include as string) ?? "[]");

    const entries = await api.getEntries(req.params.collection, {
      includeCount,
      limit,
      offset,
      filters,
      sort,
      include,
    });
    res.json(entries);
  });

  app.get("/api/collections/:collection/entries/:id", async (req, res) => {
    const include = JSON.parse((req.query.include as string) ?? "[]");
    const entry = await api.getEntry(req.params.collection, req.params.id, {
      include,
    });
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
    const limit = Number(req.query.limit ?? 100);
    const search = req.query.search as string;
    const startAfter = req.query.startAfter as string | undefined;
    const assets = await api.listAssets({
      limit,
      search,
      startAfter,
    });
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
    // console.log(`Server running at http://localhost:${port}`);
  });

  if (options?.useViteServer) {
    await startViteServer(options?.viteRoot ?? __dirname);
  } else {
    const uiServer = express();
    uiServer.use(express.static(path.join(__dirname, "editorClient")));

    // app.use(express.static(path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'dist/client'), { index: false }));

    uiServer.use("*", async (_, res) => {
      try {
        const template = await fs.readFile(
          path.join(__dirname, "editorClient", "index.html"),
          "utf-8"
        );
        // const { render } = await import("./dist/server/entry-server.js");
        // const html = template.replace(`<!--outlet-->`, render);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (error) {
        res.status(500).end(error);
      }
    });

    uiServer.listen(7120, () => {
      console.log(`UI server running at http://localhost:7120`);
    });
  }
}
