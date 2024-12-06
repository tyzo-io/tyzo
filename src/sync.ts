import {
  convertZodSchema,
  isAssetJsonSchema,
  isImageJsonSchema,
  isVideoJsonSchema,
  serializeCollection,
  SerializedCollection,
  SerializedGlobal,
  serializeGlobal,
} from "./schemas";
import { Request, Response } from "express";
import { managementApiClient } from "./apiClient";
import { LocalApi } from "./localApi";
import { JSONSchemaType } from "ajv";

const localApiUrl = "http://localhost:3456/api";

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
  syncLogs: string[];
}

let currentSyncStatus: SyncStatus = {
  inProgress: false,
  type: null,
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

  // // Helper to convert URLs in text content (rich text or markdown)
  // function convertUrlsInText(text: string): string {
  //   // Match markdown image syntax ![alt](url) or plain URLs
  //   const urlPattern = /(!?\[.*?\]\(\/api\/assets\/[^)]+\))|(?<![![(])\/api\/assets\/[^)\s]+/g;
  //   return text.replace(urlPattern, (match) => {
  //     if (match.startsWith('![') || match.startsWith('[')) {
  //       // Handle markdown image/link syntax
  //       return match.replace(
  //         /(\/api\/assets\/[^)]+)/,
  //         (url) => convertUrl(url)
  //       );
  //     }
  //     // Handle plain URLs
  //     return convertUrl(match);
  //   });
  // }

  // Helper to process an object based on its schema
  function processValue(value: any, schema: JSONSchemaType<any>): any {
    if (!value) return value;

    // Handle arrays
    if (schema.type === "array") {
      return value.map((item: any) => processValue(item, schema.items));
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

    // // Handle rich text and markdown (they might contain asset URLs)
    // if (isRichText(schema) || isMarkdown(schema)) {
    //   if (typeof value === 'string') {
    //     return convertUrlsInText(value);
    //   }
    //   if (typeof value === 'object') {
    //     const key = isRichText(schema) ? 'richText' : 'markdown';
    //     return {
    //       ...value,
    //       [key]: convertUrlsInText(value[key])
    //     };
    //   }
    //   return value;
    // }

    // // Handle strings (might be direct URLs)
    // if (schema.type === "string" && typeof value === "string") {
    //   return convertUrl(value);
    // }

    return value;
  }

  return processValue(entry, schema);
}

export function syncRoutesFactory(api: LocalApi) {

  function getRemoteConfig(stage: string | undefined) {
    const remoteBaseUrl = process.env.REMOTE_TYZO_URL ?? "https://api.tyzo.io";
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

      // const otherCollections = collections.filter(c => c).reduce((acc, c) => {
      //   acc[c.name] = serializeCollection(c);
      //   return acc;
      // }, {} as Record<string, SerializedCollection>),

      let total = 0;
      let current = 0;

      // Syncing the assets first
      // They take the longest to sync and they don't reference anything else
      // but they are likely to be referenced by antries or globals
      if (assets) {
        const assetEntries = await api.listAssets();
        total += assetEntries.length;
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
            console.log(1, file.contentType);
            await remoteApi.uploadAsset(file.data, {
              filename: asset.name,
              contentType: file.contentType,
            });
          }
          currentSyncStatus.progress.current++;
        }
      }

      if (schema) {
        total += 1;
        currentSyncStatus.progress = {
          total,
          current,
          phase: "Syncing schema...",
        };
        addSyncLog("Syncing schema");
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

        currentSyncStatus.progress.current++;
      }

      if (syncEntries) {
        for (const collection of collections) {
          const { entries } = await api.getEntries(collection.name);
          total += entries.length;
          currentSyncStatus.progress = {
            total,
            current,
            phase: "Syncing content...",
          };
          addSyncLog(`Syncing content for ${collection.name}`);
          for (const entry of entries) {
            addSyncLog(
              `Syncing content for ${collection.name}, entry ${
                (entry as Record<string | number | symbol, any>)[
                  collection.idField
                ]
              }`
            );
            const convertedEntry = convertLocalUrlsToRemote({
              entry,
              remoteBaseUrl: remoteConfig.remoteBaseUrl,
              schema: convertZodSchema(collection.schema) as any,
            });
            await remoteApi.setEntry(
              collection.name,
              (convertedEntry as Record<string | number | symbol, any>)[
                collection.idField
              ],
              convertedEntry
            );
            currentSyncStatus.progress.current++;
          }
        }
      }

      if (syncGlobals) {
        total += globals.length;
        for (const global of globals) {
          const value = await api.getGlobalValue(global.name);
          if (value) {
            addSyncLog(`Syncing global ${global.name}`);
            // Convert local URLs to remote URLs before syncing
            const convertedValue = convertLocalUrlsToRemote({
              entry: value,
              remoteBaseUrl: remoteConfig.remoteBaseUrl,
              schema: convertZodSchema(global.schema) as any,
            });
            await remoteApi.setGlobalValue(global.name, convertedValue);
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
        progress: {
          total: 2,
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
  return {
    syncUp,
    currentSyncStatus() {
      return {
        ...currentSyncStatus,
        syncLogs,
      };
    },
  };
}
