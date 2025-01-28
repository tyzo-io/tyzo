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
import { useApiClient, useAssets, useUploadAsset } from "../useApi";
import { AssetType } from "../../content";
import { Upload, File, Search } from "lucide-react";
import { useDebouncedValue } from "../utils";

export const AssetInput = React.forwardRef<
  HTMLInputElement,
  {
    value: AssetType | undefined;
    onChange: (value: AssetType) => void;
  }
>(({ value, onChange }, ref) => {
  const apiClient = useApiClient();
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const { data: assets } = useAssets({
    search: debouncedSearch,
    enabled: isOpen
  });
  const uploadAsset = useUploadAsset();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          ref={ref}
          type="text"
          disabled
          value={value?.url || ""}
          placeholder="Asset URL"
        />
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" type="button">
              Browse
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-screen overflow-y-scroll">
            <DialogHeader>
              <DialogTitle>Select Asset</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="assets" className="flex-1 overflow-hidden">
              <TabsList>
                <TabsTrigger value="assets">
                  <File className="w-4 h-4 mr-2" />
                  Assets
                </TabsTrigger>
                <TabsTrigger value="upload">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </TabsTrigger>
              </TabsList>
              <TabsContent
                value="assets"
                className="flex flex-col space-y-4 mt-4 h-[calc(80vh-10rem)]"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search assets..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pr-4">
                  {assets?.assets?.map((asset) => (
                    <div
                      key={asset.key}
                      className="relative group cursor-pointer rounded-lg overflow-hidden border hover:border-primary p-4 bg-card transition-colors"
                      onClick={() => {
                        onChange({
                          key: asset.key,
                          url: apiClient.getAssetUrl(asset.key),
                        });
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <File className="w-4 h-4 shrink-0" />
                        <span className="text-sm truncate">{asset.key}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {asset.httpMetadata?.contentType}
                      </div>
                    </div>
                  ))}
                  {assets?.assets?.length === 0 && (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      No assets found
                    </div>
                  )}
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
                          key: asset.key,
                          url: apiClient.getAssetUrl(asset.key),
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
