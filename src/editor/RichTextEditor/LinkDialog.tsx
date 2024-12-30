import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface LinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
  url?: string;
}

export function LinkDialog({ isOpen, onClose, onSubmit, url = "" }: LinkDialogProps) {
  const [inputUrl, setInputUrl] = useState(url);

  useEffect(() => {
    if (isOpen) {
      setInputUrl(url);
    }
  }, [isOpen, url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSubmit(inputUrl);
    onClose();
  };

  const handleRemove = () => {
    onSubmit("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{url ? "Edit Link" : "Add Link"}</DialogTitle>
          <DialogDescription>
            Enter the URL you want to link to.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="https://example.com"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="col-span-3"
              autoFocus
            />
          </div>
          <DialogFooter>
            {url && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleRemove}
                className="mr-auto"
              >
                Remove Link
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
