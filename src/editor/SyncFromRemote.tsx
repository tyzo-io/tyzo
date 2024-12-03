import React, { useState } from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { notifySyncStatusListeners } from "./SyncStatus";

interface SyncOptions {
  schema: boolean;
  content: boolean;
}

export const SyncFromRemote: React.FC = () => {
  const [syncOptions, setSyncOptions] = useState<SyncOptions>({
    schema: false,
    content: false,
  });

  const handleOptionChange = (id: keyof SyncOptions, checked: boolean) => {
    setSyncOptions((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };

  const handleSync = () => {
    // TODO: Implement sync logic
    console.log("Syncing from remote with options:", syncOptions);
    notifySyncStatusListeners();
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
            checked={syncOptions.content}
            onCheckedChange={(checked) =>
              handleOptionChange("content", checked as boolean)
            }
          />
          <Label htmlFor="content">Content</Label>
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
          disabled={!Object.values(syncOptions).some(Boolean)}
          className="w-full"
        >
          Sync from Remote
        </Button>
      </div>
    </div>
  );
};
