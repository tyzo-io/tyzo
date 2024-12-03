import React from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useAssets, useUploadAsset } from "../useApi";
import { makeAssetUrl } from "../../content";
import { Link, Upload, Video } from "lucide-react";

export const VideoInput = React.forwardRef<
  HTMLInputElement,
  {
    value: {
      url: string;
      alt?: string;
      width?: number;
      height?: number;
    };
    onChange: (value: {
      url: string;
      alt?: string;
      width?: number;
      height?: number;
    }) => void;
  }
>(({ value, onChange }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { data: assets } = useAssets();
  const uploadAsset = useUploadAsset();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          ref={ref}
          type="text"
          value={value?.url || ""}
          onChange={(e) => onChange({ ...value, url: e.target.value })}
          placeholder="Video URL"
        />
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" type="button">
              Browse
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Select Video</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="url">
              <TabsList>
                <TabsTrigger value="url">
                  <Link className="w-4 h-4 mr-2" />
                  URL
                </TabsTrigger>
                <TabsTrigger value="assets">
                  <Video className="w-4 h-4 mr-2" />
                  Assets
                </TabsTrigger>
                <TabsTrigger value="upload">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </TabsTrigger>
              </TabsList>
              <TabsContent value="url" className="space-y-4">
                <Input
                  type="url"
                  value={value?.url || ""}
                  onChange={(e) => onChange({ ...value, url: e.target.value })}
                  placeholder="Enter video URL"
                />
              </TabsContent>
              <TabsContent value="assets" className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  {assets?.assets
                    ?.filter((asset) =>
                      asset.httpMetadata?.contentType?.startsWith("video/")
                    )
                    .map((asset) => (
                      <div
                        key={asset.key}
                        className="relative group cursor-pointer aspect-video rounded-lg overflow-hidden border hover:border-primary bg-muted"
                        onClick={() => {
                          onChange({
                            ...value,
                            url: makeAssetUrl(asset.key),
                          });
                          setIsOpen(false);
                        }}
                      >
                        <video
                          src={makeAssetUrl(asset.key)}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100">
                          <Video className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>
              <TabsContent value="upload" className="space-y-4">
                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8">
                  <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Select File
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="video/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const asset = await uploadAsset.mutateAsync({ file });
                        onChange({
                          ...value,
                          url: makeAssetUrl(asset.key),
                        });
                        setIsOpen(false);
                      }
                    }}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
      {value?.url && (
        <div className="relative aspect-video w-full rounded-lg overflow-hidden border bg-muted">
          <video src={value.url} controls className="w-full h-full" />
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <Input
          type="text"
          value={value?.alt || ""}
          onChange={(e) => onChange({ ...value, alt: e.target.value })}
          placeholder="Alt text (optional)"
        />
        <Input
          type="number"
          value={value?.width || ""}
          onChange={(e) =>
            onChange({
              ...value,
              width: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          placeholder="Width (optional)"
        />
        <Input
          type="number"
          value={value?.height || ""}
          onChange={(e) =>
            onChange({
              ...value,
              height: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          placeholder="Height (optional)"
        />
      </div>
    </div>
  );
});

VideoInput.displayName = "VideoInput";
