import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { localApiUrl } from "./useApi";
import { SyncStatus } from "../sync";
import { Progress } from "./ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { X } from "lucide-react";

interface SyncStatusContextType {
  status: SyncStatus;
  checkStatus: () => Promise<void>;
  notifySyncStatusChange: () => void;
}

const SyncStatusContext = createContext<SyncStatusContextType | undefined>(undefined);

export function SyncStatusProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SyncStatus>({
    inProgress: false,
    type: null,
    startedAt: undefined,
    progress: {
      total: 0,
      current: 0,
      phase: "",
    },
    syncLogs: [],
  });

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
    // Initial status check
    checkStatus();

    // Set up polling interval
    const intervalId = setInterval(checkStatus, 1000);
    return () => clearInterval(intervalId);
  }, [checkStatus]);

  const notifySyncStatusChange = useCallback(() => {
    checkStatus();
  }, [checkStatus]);

  const value = {
    status,
    checkStatus,
    notifySyncStatusChange,
  };

  return (
    <SyncStatusContext.Provider value={value}>
      {children}
    </SyncStatusContext.Provider>
  );
}

export function useSyncStatus() {
  const context = useContext(SyncStatusContext);
  if (context === undefined) {
    throw new Error("useSyncStatus must be used within a SyncStatusProvider");
  }
  return context;
}

export function SyncStatus({ withClose }: { withClose?: boolean }) {
  const { status } = useSyncStatus();
  const [hideTimestamp, setHidetimestamp] = useState<number>();
  const [dialogOpen, setDialogOpen] = useState(false);

  const lastLog = status.syncLogs[status.syncLogs.length - 1];
  const progress = Math.round(
    (status.progress.current / status.progress.total) * 100
  );

  if (!status.startedAt || status.startedAt === hideTimestamp) {
    return null;
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <div className="p-4 w-full">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">
            {status.type === "up" ? "Syncing to Remote" : "Syncing from Remote"}
          </h3>
          {withClose && status.startedAt && (
            <Button
              variant="ghost"
              onClick={() => {
                setHidetimestamp(status.startedAt);
              }}
            >
              <X />
            </Button>
          )}
        </div>
        <p className="mb-2">{status.progress.phase}</p>
        <div className="w-64 h-2 bg-gray-200 rounded-full">
          <Progress className="w-full" value={progress} />
        </div>
        <p className="mt-2 text-sm text-gray-600">
          {status.progress.current} / {status.progress.total}
        </p>
        <DialogTrigger>{lastLog}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sync Logs</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
            {status.syncLogs.map((log, index) => (
              <div
                key={index}
                className="text-sm text-gray-600 border-b border-gray-100 py-2 last:border-0"
              >
                {log}
              </div>
            ))}
          </div>
        </DialogContent>
      </div>
    </Dialog>
  );
}
