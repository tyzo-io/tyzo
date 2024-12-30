import {
  convertZodSchema,
  isAssetJsonSchema,
  isImageJsonSchema,
  isMarkdownJsonSchema,
  isRichTextJsonSchema,
  isVideoJsonSchema,
  serializeCollection,
  SerializedCollection,
  SerializedGlobal,
  serializeGlobal,
} from "./schemas.js";
import { Request, Response } from "express";
import { managementApiClient } from "./apiClient/index.js";
import { LocalApi } from "./localApi.js";
import { JSONSchemaType } from "ajv";
import { z } from "zod";

const localApiUrl = "http://localhost:3456/api";

// Sync status tracking
export interface SyncStatus {
  inProgress: boolean;
  type: "up" | "down" | null;
  startedAt: number | undefined;
  progress: {
    total: number;
    current: number;
    phase: string;
  };
  error?: string;
  syncLogs: string[];
}

let currentSyncStatus: SyncStatus = {
  inProgress: false,
  type: null,
  startedAt: undefined,
  progress: {
    total: 0,
    current: 0,
    phase: "",
  },
  syncLogs: [],
};

let syncLogs: string[] = [];

function clearSyncLogs() {
  syncLogs = [];
}

function addSyncLog(log: string) {
  syncLogs.push(log);
}

export function convertLocalUrlsToRemote<T>({
  entry,
  remoteBaseUrl,
  schema,
}: {
  entry: T;
  remoteBaseUrl: string;
  schema: JSONSchemaType<any>;
}): T {
  if (!schema || !entry) return entry;

  // Helper to convert a local URL to remote URL
  function convertUrl(url: string): string {
    while (url.includes(localApiUrl)) {
      url = url.replace(localApiUrl, remoteBaseUrl);
    }
    return url;
  }

  // Helper to process an object based on its schema
  function processValue(value: any, schema: JSONSchemaType<any>): any {
    if (!value) return value;

    // Handle arrays
    if (schema.type === "array") {
      return value.map((item: any) => processValue(item, schema.items));
    }

    // Handle asset types
    if (isImageJsonSchema(schema)) {
      if (typeof value === "object" && value.url) {
        return {
          ...value,
          url: convertUrl(value.url),
          srcset: value.srcset ? convertUrl(value.srcset) : value.srcset,
        };
      }
      return value;
    }
    if (isVideoJsonSchema(schema) || isAssetJsonSchema(schema)) {
      if (typeof value === "object" && value.url) {
        return {
          ...value,
          url: convertUrl(value.url),
        };
      }
      return value;
    }

    if (isRichTextJsonSchema(schema)) {
      if (typeof value?.richText === "string") {
        return { richText: convertUrl(value.richText) };
      }
    }

    if (isMarkdownJsonSchema(schema)) {
      if (typeof value?.markdown === "string") {
        return { markdown: convertUrl(value.markdown) };
      }
    }

    // Handle objects
    if (schema.type === "object") {
      const result: any = {};

      for (const key in value) {
        if (key in (schema.properties ?? {})) {
          result[key] = processValue(value[key], schema.properties[key]);
        } else {
          result[key] = value[key];
        }
      }
      return result;
    }


    return value;
  }

  return processValue(entry, schema);
}

export function syncRoutesFactory(api: LocalApi) {
  function getRemoteConfig(stage: string | undefined) {
    const remoteBaseUrl = process.env.REMOTE_TYZO_URL ?? "https://cd.tyzo.io";
    const space = process.env.TYZO_SPACE as string;

    return {
      remoteBaseUrl,
      space,
      stage: stage ?? "main",
    };
  }


  function getRemoteApiClient({
    remoteBaseUrl,
    space,
    stage,
    token,
  }: {
    remoteBaseUrl: string;
    space: string;
    stage: string;
    token: string;
  }) {
    const remoteUrl = `${remoteBaseUrl}/content/${space}:${stage}`;
    console.log("Remote API URL:", remoteUrl);
    const remoteApi = managementApiClient({
      API_URL: remoteUrl,
      token: () => token,
    });
    return remoteApi;
  }

  const MAX_RETRIES = 3;
  const INITIAL_RETRY_DELAY = 1000;

  async function withRetry<T>(
    operation: () => Promise<T>,
    description: string
  ): Promise<T> {
    let lastError: Error | undefined;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (attempt < MAX_RETRIES - 1) {
          const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
          addSyncLog(
            `Failed to ${description}. Retrying in ${delay / 1000}s... (${
              attempt + 1
            }/${MAX_RETRIES})`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
    throw lastError;
  }

  const syncUp = async (req: Request, res: Response) => {
    if (currentSyncStatus.inProgress) {
      res.status(409).json({
        error: `Sync already in progress (${currentSyncStatus.type})`,
      });
      return;
    }

    const { schema, entries: syncEntries, globals: syncGlobals, assets, stage, token } = req.body;
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
    if (!schema && !syncEntries && !assets && !syncGlobals) {
      res.status(400).json({
        error: "Must specify at least one of: schema, entries, globals, assets",
      });
      return;
    }

    clearSyncLogs();

    currentSyncStatus = {
      inProgress: true,
      type: "up",
      startedAt: Date.now(),
      progress: {
        total: 0,
        current: 0,
        phase: "Starting sync to remote...",
      },
      syncLogs,
    };

    addSyncLog("Starting sync to remote...");

    try {
      const remoteConfig = getRemoteConfig(stage);
      const remoteApi = getRemoteApiClient({ ...remoteConfig, token });
      const collections = await api.getCollections();
      const globals = await api.getGlobals();

      let total = 0;
      let current = 0;

      // const doTest = false
      // if (doTest) {
      //   currentSyncStatus.progress.total = 10;
      //   while (current < 10) {
      //     await new Promise((resolve) => {
      //       setTimeout(() => {
      //         resolve(true);
      //       }, 1000);
      //     });
      //     current++;
      //     currentSyncStatus.progress.current = current;
      //   }
      //   res.json({ success: true });
      //   return
      // }

      if (assets) {
        const assetEntries = await api.listAssets();
        total += assetEntries.length;
      }
      if (schema) {
        total += 1;
      }
      if (syncEntries) {
        for (const collection of collections) {
          const { entries } = await api.getEntries(collection.name);
          total += entries.length;
        }
      }
      if (syncGlobals) {
        total += globals.length;
      }

      currentSyncStatus.progress.total = total;

      const allCollections = collections.reduce((acc, col) => {
        acc[col.name] = col.schema;
        return acc;
      }, {} as Record<string, z.ZodType<any>>)

      // Syncing the assets first
      // They take the longest to sync and they don't reference anything else
      // but they are likely to be referenced by antries or globals
      if (assets) {
        const assetEntries = await api.listAssets();
        currentSyncStatus.progress = {
          total,
          current,
          phase: "Syncing assets...",
        };
        addSyncLog("Syncing assets");
        for (const asset of assetEntries) {
          addSyncLog(`Syncing asset ${asset.key}`);
          const file = await api.getAsset(asset.key);
          if (file) {
            await remoteApi.uploadAsset(file.data, {
              filename: asset.name,
              contentType: file.contentType,
            });
          }
          current++;
          currentSyncStatus.progress.current = current;
        }
      }

      if (schema) {
        currentSyncStatus.progress = {
          total,
          current,
          phase: "Syncing schema...",
        };
        addSyncLog("Syncing schema");
        const res = await remoteApi.updateSchema({
          stage,
          collections: collections.reduce((acc, c) => {
            acc[c.name] = serializeCollection(c, allCollections);
            return acc;
          }, {} as Record<string, SerializedCollection>),
          globals: globals.reduce((acc, g) => {
            acc[g.name] = serializeGlobal(g, allCollections);
            return acc;
          }, {} as Record<string, SerializedGlobal>),
        });

        current++;
        currentSyncStatus.progress.current = current;
      }

      if (syncEntries) {
        for (const collection of collections) {
          const { entries } = await api.getEntries(collection.name);
          currentSyncStatus.progress = {
            total,
            current,
            phase: "Syncing content...",
          };
          addSyncLog(`Syncing content for ${collection.name}`);

          // Process entries in parallel with a concurrency limit
          const BATCH_SIZE = 5;
          for (let i = 0; i < entries.length; i += BATCH_SIZE) {
            const batch = entries.slice(i, i + BATCH_SIZE);
            await Promise.all(
              batch.map(async (entry) => {
                addSyncLog(
                  `Syncing content for ${collection.name}, entry ${
                    (entry as Record<string | number | symbol, any>)[
                      collection.idField
                    ]
                  }`
                );
                const convertedEntry = convertLocalUrlsToRemote({
                  entry,
                  remoteBaseUrl: remoteApi.apiUrl,
                  schema: convertZodSchema(
                    collection.schema,
                    allCollections
                  ) as any,
                });
                await withRetry(
                  () =>
                    remoteApi.setEntry(
                      collection.name,
                      (convertedEntry as Record<string | number | symbol, any>)[
                        collection.idField
                      ],
                      convertedEntry
                    ),
                  `sync entry ${collection.name}`
                );
                current++;
                currentSyncStatus.progress.current = current;
              })
            );
          }
        }
      }

      if (syncGlobals) {
        for (const global of globals) {
          const value = await api.getGlobalValue(global.name);
          if (value) {
            addSyncLog(`Syncing global ${global.name}`);
            // Convert local URLs to remote URLs before syncing
            const convertedValue = convertLocalUrlsToRemote({
              entry: value,
              remoteBaseUrl: remoteApi.apiUrl,
              schema: convertZodSchema(global.schema, allCollections) as any,
            });
            await remoteApi.setGlobalValue(global.name, convertedValue);
            current++;
            currentSyncStatus.progress.current = current;
          }
        }
      }

      currentSyncStatus = {
        inProgress: false,
        type: null,
        startedAt: currentSyncStatus.startedAt,
        progress: {
          total,
          current,
          phase: "Sync completed successfully",
        },
        syncLogs,
      };
      addSyncLog("Sync completed successfully");

      res.json({ success: true });
    } catch (error) {
      console.error(error);
      addSyncLog(
        `Sync failed: ${
          error instanceof Error ? error.message : "Unknown error occurred"
        }`
      );
      currentSyncStatus = {
        inProgress: false,
        type: null,
        startedAt: currentSyncStatus.startedAt,
        progress: {
          total: 0,
          current: 0,
          phase: "Sync failed",
        },
        syncLogs,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };

      res.status(500).json({
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

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

  async function downloadAsset(stage: string, token: string, key: string) {
    const remoteConfig = getRemoteConfig(stage);
    const remoteApi = getRemoteApiClient({ ...remoteConfig, token });
    const response = await remoteApi.downloadAsset(key);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const blob = await response.blob();
    const buffer: Buffer = Buffer.from(await blob.arrayBuffer());
    await api.uploadAsset(buffer, {
      filename: key,
      contentType: blob.type,
    });
  }

  return {
    syncUp,
    downloadAsset,
    currentSyncStatus() {
      return {
        ...currentSyncStatus,
        syncLogs,
      };
    },
  };
}
