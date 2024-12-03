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
import { Link, Upload, File } from "lucide-react";

export const AssetInput = React.forwardRef<
  HTMLInputElement,
  {
    value: {
      url: string;
    };
    onChange: (value: { url: string }) => void;
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
          onChange={(e) => onChange({ url: e.target.value })}
          placeholder="Asset URL"
        />
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" type="button">
              Browse
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Select Asset</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="url">
              <TabsList>
                <TabsTrigger value="url">
                  <Link className="w-4 h-4 mr-2" />
                  URL
                </TabsTrigger>
                <TabsTrigger value="assets">
                  <File className="w-4 h-4 mr-2" />
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
                  onChange={(e) => onChange({ url: e.target.value })}
                  placeholder="Enter asset URL"
                />
              </TabsContent>
              <TabsContent value="assets" className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  {assets?.assets?.map((asset) => (
                    <div
                      key={asset.key}
                      className="relative group cursor-pointer rounded-lg overflow-hidden border hover:border-primary p-4"
                      onClick={() => {
                        onChange({
                          url: makeAssetUrl(asset.key),
                        });
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <File className="w-4 h-4" />
                        <span className="text-sm truncate">{asset.key}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {asset.httpMetadata?.contentType}
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
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const asset = await uploadAsset.mutate(file);
                        onChange({
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
    </div>
  );
});

AssetInput.displayName = "AssetInput";
