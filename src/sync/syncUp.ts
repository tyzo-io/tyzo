import {
  convertZodSchema,
  serializeCollection,
  SerializedCollection,
  SerializedGlobal,
  serializeGlobal,
} from "../schemas.js";
import { Request, Response } from "express";
import { LocalApi } from "../localApi.js";
import { z } from "zod";
import { type SyncStatus } from "./types.js";
import { convertLocalUrlsToRemote } from "./urls.js";
import { getRemoteApiClient, getRemoteConfig, withRetry } from "./util.js";
export { type SyncStatus } from "./types.js";

export function syncUpFactory({
  api,
  currentSyncStatus,
  updateSyncStatus,
  updateSyncProgress,
  clearSyncLogs,
  addSyncLog,
}: {
  api: LocalApi;
  currentSyncStatus: () => SyncStatus;
  updateSyncStatus: (status: Omit<SyncStatus, "syncLogs">) => void;
  updateSyncProgress: (status: Partial<SyncStatus["progress"]>) => void;
  clearSyncLogs: () => void;
  addSyncLog: (log: string) => void;
}) {
  const syncUp = async (req: Request, res: Response) => {
    if (currentSyncStatus().inProgress) {
      res.status(409).json({
        error: `Sync already in progress (${currentSyncStatus().type})`,
      });
      return;
    }

    const {
      schema,
      entries: syncEntries,
      globals: syncGlobals,
      assets,
      stage,
      token,
    } = req.body;
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

    const startedAt = Date.now();
    updateSyncStatus({
      inProgress: true,
      type: "up",
      startedAt,
      progress: {
        total: 0,
        current: 0,
        phase: "Starting sync to remote...",
      },
    });

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

      updateSyncProgress({
        total,
      });

      const allCollections = collections.reduce((acc, col) => {
        acc[col.name] = col.schema;
        return acc;
      }, {} as Record<string, z.ZodType<any>>);

      // Syncing the assets first
      // They take the longest to sync and they don't reference anything else
      // but they are likely to be referenced by antries or globals
      if (assets) {
        const assetEntries = await api.listAssets();
        updateSyncProgress({
          phase: "Syncing assets...",
        });
        addSyncLog("Syncing assets");
        for (const asset of assetEntries) {
          addSyncLog(`Syncing asset ${asset.key}`);
          const file = await api.getAsset(asset.key);
          if (file) {
            await remoteApi.uploadAsset(file.data, {
              filename: asset.name,
              contentType: file.contentType,
              width: file.width,
              height: file.height,
            });
          }
          current++;
          updateSyncProgress({
            current,
          });
        }
      }

      if (schema) {
        updateSyncProgress({
          phase: "Syncing schema...",
        });
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
        updateSyncProgress({
          current,
        });
      }

      if (syncEntries) {
        for (const collection of collections) {
          const { entries } = await api.getEntries(collection.name);
          updateSyncProgress({
            phase: "Syncing content...",
          });
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
                  (delay, attempt, maxRetries) => {
                    addSyncLog(
                      `Failed to sync entry ${collection.name}. Retrying in ${
                        delay / 1000
                      }s... (${attempt + 1}/${maxRetries})`
                    );
                  }
                );
                current++;
                updateSyncProgress({
                  current,
                });
              })
            );
          }
        }
      }

      if (syncGlobals) {
        updateSyncProgress({
          phase: "Syncing globals...",
        });
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
            updateSyncProgress({
              current,
            });
          }
        }
      }

      updateSyncStatus({
        type: null,
        inProgress: false,
        startedAt,
        progress: {
          total,
          current,
          phase: "Sync completed successfully",
        },
      });
      addSyncLog("Sync completed successfully");

      res.json({ success: true });
    } catch (error) {
      console.error(error);
      addSyncLog(
        `Sync failed: ${
          error instanceof Error ? error.message : "Unknown error occurred"
        }`
      );
      updateSyncStatus({
        type: null,
        inProgress: false,
        startedAt,
        progress: {
          total: 0,
          current: 0,
          phase: "Sync failed",
        },
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });

      res.status(500).json({
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  return syncUp;
}
