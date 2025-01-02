import React, { useState } from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { SyncStatus, useSyncStatus } from "./SyncStatus";
import { localApiUrl } from "./useApi";
import { Input } from "./ui/input";
import { getAuthToken } from "./utils";

interface SyncOptions {
  schema: boolean;
  entries: boolean;
  globals: boolean;
  stage: string;
}

export const SyncFromRemote: React.FC = () => {
  const { status, notifySyncStatusChange } = useSyncStatus();

  const [syncOptions, setSyncOptions] = useState<SyncOptions>({
    schema: false,
    entries: false,
    globals: false,
    stage: "main",
  });

  const handleOptionChange = <T extends keyof SyncOptions>(
    id: T,
    checked: SyncOptions[T]
  ) => {
    setSyncOptions((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };

  const handleSync = () => {
    try {
      fetch(`${localApiUrl}/sync/down`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          schema: syncOptions.schema,
          entries: syncOptions.entries,
          globals: syncOptions.globals,
          stage: syncOptions.stage,
          token: getAuthToken(),
        }),
      }).then(() => {
        notifySyncStatusChange();
      });
    } catch (error) {
      console.error("Error during sync:", error);
    }
  };

  return (
    <div>
      <Alert className="mb-6">
        <AlertDescription>
          Syncing will overwrite your local schema and content with remote data.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="schema"
            checked={syncOptions.schema}
            onCheckedChange={(checked) =>
              handleOptionChange("schema", checked as boolean)
            }
          />
          <Label htmlFor="schema">Schema</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="content"
            checked={syncOptions.entries}
            onCheckedChange={(checked) =>
              handleOptionChange("entries", checked as boolean)
            }
          />
          <Label htmlFor="content">Content</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="globals"
            checked={syncOptions.globals}
            onCheckedChange={(checked) =>
              handleOptionChange("globals", checked as boolean)
            }
          />
          <Label htmlFor="globals">Globals</Label>
        </div>

        <div className="flex flex-col space-y-2 mt-4">
          <Label htmlFor="stage">Stage</Label>
          <Input
            id="stage"
            value={syncOptions.stage}
            onChange={(e) => handleOptionChange("stage", e.target.value)}
          />
        </div>

        <Alert className="mt-4">
          <AlertDescription>
            Note: Assets can be synced individually.
          </AlertDescription>
        </Alert>
      </div>

      <div className="mt-6">
        <Button
          onClick={handleSync}
          disabled={
            !Object.values({
              entries: syncOptions.entries,
              globals: syncOptions.globals,
              schema: syncOptions.schema,
            }).some(Boolean) ||
            !syncOptions.stage.length ||
            status.inProgress
          }
          className="w-full"
        >
          Sync from Remote
        </Button>
        <SyncStatus />
      </div>
    </div>
  );
};
