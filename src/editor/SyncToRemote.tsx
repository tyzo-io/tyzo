import React, { useState } from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { notifySyncStatusListeners, useSyncStatus } from "./SyncStatus";
import { localApiUrl } from "./useApi";
import { getAuthToken } from "./utils";
import { Input } from "./ui/input";

interface SyncOptions {
  schema: boolean;
  content: boolean;
  assets: boolean;
  stage: string;
}

export const SyncToRemote: React.FC = () => {
  const [syncOptions, setSyncOptions] = useState<SyncOptions>({
    schema: false,
    content: false,
    assets: false,
    stage: "main",
  });

  const { status } = useSyncStatus();

  const handleOptionChange = <T extends keyof SyncOptions>(
    id: T,
    checked: SyncOptions[T]
  ) => {
    setSyncOptions((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };

  const handleSync = async () => {
    await fetch(`${localApiUrl}/sync/up`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        schema: syncOptions.schema,
        content: syncOptions.content,
        assets: syncOptions.assets,
        stage: syncOptions.stage,
        token: getAuthToken(),
      }),
    });
    notifySyncStatusListeners();
  };

  return (
    <div>
      <Alert className="mb-6">
        <AlertDescription>
          Syncing will overwrite existing schema and content on the remote
          server.
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
            checked={syncOptions.content}
            onCheckedChange={(checked) =>
              handleOptionChange("content", checked as boolean)
            }
          />
          <Label htmlFor="content">Content</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="assets"
            checked={syncOptions.assets}
            onCheckedChange={(checked) =>
              handleOptionChange("assets", checked as boolean)
            }
          />
          <Label htmlFor="assets">Assets</Label>
        </div>

        <div className="flex flex-col space-y-2 mt-4">
          <Label htmlFor="stage">Stage</Label>
          <Input
            id="stage"
            value={syncOptions.stage}
            onChange={(e) => handleOptionChange("stage", e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6">
        <Button
          onClick={handleSync}
          disabled={
            !Object.values({
              assets: syncOptions.assets,
              content: syncOptions.content,
              schema: syncOptions.schema,
            }).some(Boolean) ||
            !syncOptions.stage.length ||
            status.inProgress
          }
          className="w-full"
        >
          Sync to Remote
        </Button>
      </div>
    </div>
  );
};
