import React from "react";
import { useCallback, useEffect, useState } from "react";
import { localApiUrl } from "./useApi";
import { SyncStatus } from "../sync";
import { Progress } from "./ui/progress";

const listeners = new Set<() => void>();

export function addSyncStatusListener(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifySyncStatusListeners() {
  listeners.forEach((listener) => listener());
}

export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatus>({
    inProgress: false,
    type: null,
    progress: {
      total: 0,
      current: 0,
      phase: "",
    },
    syncLogs: [],
  });

  useEffect(() => {
    const listener = () => {
      checkStatus();
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch(`${localApiUrl}/sync/status`);
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error("Failed to fetch sync status:", error);
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (status.inProgress) {
      interval = setInterval(checkStatus, 1000);
    } else {
      checkStatus();
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [status.inProgress]);

  return { status, checkStatus };
}

export function SyncStatus() {
  const { status } = useSyncStatus();

  if (!status.inProgress) {
    if (status.syncLogs.length > 0) {
      return (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Sync Complete</h3>
          {status.syncLogs.map((log, index) => (
            <p key={index}>{log}</p>
          ))}
        </div>
      );
    } else {
      return null;
    }
  }

  const progress = Math.round(
    (status.progress.current / status.progress.total) * 100
  );

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-2">
        {status.type === "up" ? "Syncing to Remote" : "Syncing from Remote"}
      </h3>
      <p className="mb-2">{status.progress.phase}</p>
      <div className="w-64 h-2 bg-gray-200 rounded-full">
        <Progress value={progress} />
      </div>
      <p className="mt-2 text-sm text-gray-600">
        {status.progress.current} / {status.progress.total}
      </p>
      {status.syncLogs.map((log, index) => (
        <p key={index}>{log}</p>
      ))}
    </div>
  );
}
