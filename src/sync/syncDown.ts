import { Request, Response } from "express";
import { LocalApi } from "../localApi.js";
import { type SyncStatus } from "./types.js";
import { convertRemoteUrlsToLocal } from "./urls.js";
import { getRemoteApiClient, getRemoteConfig, withRetry } from "./util.js";
import { JSONSchemaType } from "ajv";

export function syncDownFactory({
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
  const syncDown = async (req: Request, res: Response) => {
    if (currentSyncStatus().inProgress) {
      res.status(409).json({
        error: `Sync already in progress (${currentSyncStatus().type})`,
      });
      return;
    }

    const {
      schema: syncSchema,
      entries: syncEntries,
      globals: syncGlobals,
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
    if (!syncSchema && !syncEntries && !syncGlobals) {
      res.status(400).json({
        error: "Must specify at least one of: schema, entries, globals",
      });
      return;
    }

    clearSyncLogs();

    const startedAt = Date.now();
    updateSyncStatus({
      inProgress: true,
      type: "down",
      startedAt,
      progress: {
        total: 0,
        current: 0,
        phase: "Starting sync from remote...",
      },
    });

    addSyncLog("Starting sync from remote...");

    try {
      const remoteConfig = getRemoteConfig(stage);
      const remoteApi = getRemoteApiClient({ ...remoteConfig, token });

      let total = 0;
      let current = 0;

      // Get remote schema first to know what to sync
      const remoteSchema = await remoteApi.getSchema();
      const collections = Object.entries(remoteSchema.collections).map(
        ([name, collection]) => ({
          name,
          schema: collection.schema,
          idField: collection.idField,
        })
      );
      const globals = Object.entries(remoteSchema.globals).map(
        ([name, global]) => ({
          name,
          schema: global.schema,
        })
      );

      if (syncSchema) {
        total += 1;
      }
      if (syncEntries) {
        total += collections.length;
      }
      if (syncGlobals) {
        total += globals.length;
      }

      updateSyncProgress({
        total,
      });

      if (syncSchema) {
        updateSyncProgress({
          phase: "Syncing schema...",
        });
        addSyncLog("Syncing schema");

        await api.setConfig({
          collections,
          globals,
        });

        current++;
        updateSyncProgress({
          current,
        });
      }

      if (syncGlobals) {
        updateSyncProgress({
          phase: "Syncing globals...",
        });
        for (const global of globals) {
          const value = await remoteApi.getGlobalValue(global.name);
          if (value) {
            addSyncLog(`Syncing global ${global.name}`);
            // Convert remote URLs to local URLs before syncing
            const convertedValue = convertRemoteUrlsToLocal({
              entry: value,
              remoteBaseUrl: remoteApi.apiUrl,
              schema: global.schema as JSONSchemaType<any>,
            });
            await api.setGlobalValue(global.name, convertedValue);
            current++;
            updateSyncProgress({
              current,
            });
          }
        }
      }

      if (syncEntries) {
        updateSyncProgress({
          phase: "Syncing content...",
        });
        for (const collection of collections) {
          addSyncLog(`Syncing content for ${collection.name}`);

          let offset = 0;
          const BATCH_SIZE = 1000;
          while (true) {
            const { entries } = await remoteApi.getEntries(collection.name, {
              limit: BATCH_SIZE,
              offset,
            });
            for (const entry of entries) {
              const convertedEntry = convertRemoteUrlsToLocal({
                entry,
                remoteBaseUrl: remoteApi.apiUrl,
                schema: collection.schema as JSONSchemaType<any>,
              });
              await api.setEntry(
                collection.name,
                (entry as Record<string, any>)[collection.idField],
                convertedEntry
              );
            }
            if (entries.length < BATCH_SIZE) {
              break;
            }
          }
          current++;
          updateSyncProgress({
            current,
          });
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

  return syncDown;
}
