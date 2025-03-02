import React from "react";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useApiClient, useAssets, useUploadAsset } from "./useApi";
import { ImageType } from "../content";
import { ImageIcon, Link, Upload, Search } from "lucide-react";
import { useDebouncedValue } from "./utils";

export const ImageInput = React.forwardRef<
  HTMLInputElement,
  {
    value: ImageType | undefined;
    onChange: (value: ImageType) => void;
    onClose?: () => void;
  }
>(({ value, onChange, onClose }, ref) => {
  const apiClient = useApiClient();
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const { data: assets } = useAssets({
    search: debouncedSearch,
    enabled: isOpen,
  });
  const uploadAsset = useUploadAsset();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const generateImageConfig = (
    assetKey: string,
    metadata?: { width?: number; height?: number }
  ) => {
    // Default widths for responsive images
    const widths = [320, 400, 480, 640, 750, 828, 1080, 1200, 1920, 2048];
    const formats = ["webp", "avif", "jpeg"] as const;

    // Generate srcset for each format and width
    const srcsetParts = formats.flatMap((format) =>
      widths.map((w) => {
        const url = apiClient.getAssetUrl(assetKey, {
          width: w,
          format,
          quality: format === "webp" ? 80 : 85,
        });
        return `${encodeURI(url)} ${w}w`;
      })
    );

    // Generate sizes based on common breakpoints
    const sizes = [
      ...widths.map((size) => `(max-width: ${size}px) ${size}px`),
      "2048px",
    ].join(", ");
    // [
    //   "(max-width: 640px) 100vw",
    //   "(max-width: 1024px) 75vw",
    //   "50vw",
    // ].join(", ");

    return {
      src: apiClient.getAssetUrl(assetKey),
      srcset: srcsetParts.join(", "),
      sizes,
      ...(metadata?.width && { width: metadata.width }),
      ...(metadata?.height && { height: metadata.height }),
      loading: "lazy" as const,
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          ref={ref}
          type="text"
          disabled={Boolean(value?.key)}
          value={value?.src || ""}
          onChange={(e) => onChange({ ...value, src: e.target.value })}
          placeholder="Image URL"
        />
        <Dialog
          open={isOpen}
          onOpenChange={(isOpen) => {
            setIsOpen(isOpen);
            if (!isOpen) {
              onClose?.();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button variant="outline" type="button">
              Browse
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-screen overflow-y-scroll">
            <DialogHeader>
              <DialogTitle>Select Image</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="url">
              <TabsList>
                <TabsTrigger value="url">
                  <Link className="w-4 h-4 mr-2" />
                  URL
                </TabsTrigger>
                <TabsTrigger value="assets">
                  <ImageIcon className="w-4 h-4 mr-2" />
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
                  value={value?.src || ""}
                  onChange={(e) =>
                    onChange({ ...value, key: undefined, src: e.target.value })
                  }
                  placeholder="Enter image URL"
                />
              </TabsContent>
              <TabsContent value="assets" className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search images..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {assets?.assets
                    ?.filter((asset) =>
                      asset.httpMetadata?.contentType?.startsWith("image/")
                    )
                    .map((asset) => (
                      <div
                        key={asset.key}
                        className="relative group cursor-pointer aspect-square rounded-lg overflow-hidden border hover:border-primary bg-muted"
                        onClick={() => {
                          onChange({
                            ...generateImageConfig(asset.key, asset.metadata),
                            key: asset.key,
                          });
                          setIsOpen(false);
                        }}
                      >
                        <img
                          src={apiClient.getAssetUrl(asset.key, {
                            width: 400,
                            height: 400,
                            skipVector: true,
                          })}
                          alt={asset.key}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ImageIcon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    ))}
                  {assets?.assets?.filter((asset) =>
                    asset.httpMetadata?.contentType?.startsWith("image/")
                  ).length === 0 && (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      No images found
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
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const asset = await uploadAsset.mutate(file);
                        const config = generateImageConfig(
                          asset.key,
                          asset.metadata
                        );
                        onChange({
                          key: asset.key,
                          ...value,
                          ...config,
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
      {value?.src && (
        <div className="relative aspect-video w-full rounded-lg overflow-hidden border bg-muted">
          <img
            src={value.src}
            alt={value.alt}
            className="object-contain w-full h-full"
          />
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <Input
          type="text"
          value={value?.alt || ""}
          onChange={(e) => onChange({ ...value!, alt: e.target.value })}
          placeholder="Alt text (optional)"
        />
        <Select
          value={value?.loading}
          onValueChange={(loading) =>
            onChange({ ...value!, loading: loading as "eager" | "lazy" })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Loading behavior" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lazy">Lazy</SelectItem>
            <SelectItem value="eager">Eager</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="number"
          value={value?.width || ""}
          onChange={(e) =>
            onChange({
              ...value!,
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
              ...value!,
              height: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          placeholder="Height (optional)"
        />
      </div>
      <div className="space-y-2">
        <Input
          type="text"
          value={value?.srcset || ""}
          onChange={(e) => onChange({ ...value!, srcset: e.target.value })}
          placeholder="Srcset (optional)"
        />
        <Input
          type="text"
          value={value?.sizes || ""}
          onChange={(e) => onChange({ ...value!, sizes: e.target.value })}
          placeholder="Sizes (optional)"
        />
      </div>
    </div>
  );
});

ImageInput.displayName = "ImageInput";
