import { LocalApi } from "../localApi.js";
import { SyncStatus } from "./types.js";
import { getRemoteApiClient, getRemoteConfig } from "./util.js";
import { syncUpFactory } from "./syncUp.js";
import { syncDownFactory } from "./syncDown.js";
export { type SyncStatus } from "./types.js";

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

export function syncRoutesFactory(api: LocalApi) {
  const syncUp = syncUpFactory({
    api,
    currentSyncStatus: () => currentSyncStatus,
    updateSyncStatus(status) {
      currentSyncStatus = {
        ...currentSyncStatus,
        ...status,
      };
    },
    updateSyncProgress(progress) {
      currentSyncStatus.progress = {
        ...currentSyncStatus.progress,
        ...progress,
      };
    },
    clearSyncLogs,
    addSyncLog,
  });

  const syncDown = syncDownFactory({
    api,
    currentSyncStatus: () => currentSyncStatus,
    updateSyncStatus(status) {
      currentSyncStatus = {
        ...currentSyncStatus,
        ...status,
      };
    },
    updateSyncProgress(progress) {
      currentSyncStatus.progress = {
        ...currentSyncStatus.progress,
        ...progress,
      };
    },
    clearSyncLogs,
    addSyncLog,
  });

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
    syncDown,
    downloadAsset,
    currentSyncStatus() {
      return {
        ...currentSyncStatus,
        syncLogs,
      };
    },
  };
}
