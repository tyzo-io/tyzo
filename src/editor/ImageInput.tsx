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
import { useAssets, useUploadAsset } from "./useApi";
import { ImageType, makeAssetUrl } from "../content";
import { ImageIcon, Link, Upload } from "lucide-react";

export const ImageInput = React.forwardRef<
  HTMLInputElement,
  {
    value: ImageType | undefined;
    onChange: (value: ImageType) => void;
  }
>(({ value, onChange }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { data: assets } = useAssets();
  const uploadAsset = useUploadAsset();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const generateImageConfig = (
    assetKey: string,
    metadata?: { width?: number; height?: number }
  ) => {
    // Default widths for responsive images
    const widths = [640, 750, 828, 1080, 1200, 1920, 2048];
    const formats = ["webp", "jpeg"] as const;

    // Generate srcset for each format and width
    const srcsetParts = formats.flatMap((format) =>
      widths.map((w) => {
        const url = makeAssetUrl(assetKey, {
          width: w,
          format,
          quality: format === "webp" ? 80 : 85,
        });
        return `${url} ${w}w`;
      })
    );

    // Generate sizes based on common breakpoints
    const sizes = [
      "(max-width: 640px) 100vw",
      "(max-width: 1024px) 75vw",
      "50vw",
    ].join(", ");

    return {
      url: makeAssetUrl(assetKey),
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
          value={value?.url || ""}
          onChange={(e) => onChange({ ...value, url: e.target.value })}
          placeholder="Image URL"
        />
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" type="button">
              Browse
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
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
                  value={value?.url || ""}
                  onChange={(e) =>
                    onChange({ ...value, key: undefined, url: e.target.value })
                  }
                  placeholder="Enter image URL"
                />
              </TabsContent>
              <TabsContent value="assets" className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  {assets?.assets
                    ?.filter((asset) =>
                      asset.httpMetadata?.contentType?.startsWith("image/")
                    )
                    .map((asset) => (
                      <div
                        key={asset.key}
                        className="relative group cursor-pointer aspect-square rounded-lg overflow-hidden border hover:border-primary"
                        onClick={() => {
                          const config = generateImageConfig(asset.key, {
                            // width: asset.width,
                            // height: asset.height,
                          });
                          onChange({
                            key: asset.key,
                            ...value,
                            ...config,
                          });
                          setIsOpen(false);
                        }}
                      >
                        <img
                          src={makeAssetUrl(asset.key)}
                          alt={asset.key}
                          className="object-cover w-full h-full"
                        />
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
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const asset = await uploadAsset.mutate(file);
                        const config = generateImageConfig(asset.key);
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
      {value?.url && (
        <div className="relative aspect-video w-full rounded-lg overflow-hidden border bg-muted">
          <img
            src={value.url}
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
