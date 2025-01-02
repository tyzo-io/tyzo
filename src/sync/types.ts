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
