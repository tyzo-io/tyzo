import React, { useState, useRef, useEffect } from "react";
import {
  useAssets,
  useUploadAsset,
  useDeleteAsset,
  useApiClient,
  localApiUrl,
  useApiClientContext,
} from "./useApi";
import { getAuthToken, useDebouncedValue } from "./utils";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  FileIcon,
  ImageIcon,
  VideoIcon,
  FileTextIcon,
  FileCodeIcon,
  AudioLines,
  FolderArchive,
  Upload,
  Loader2,
  Trash2,
  Copy,
  Info,
  Download,
  Loader2Icon,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Asset } from "../types";

const PageLimit = 100;

async function downloadAsset(stage: string, token: string, key: string) {
  await fetch(`${localApiUrl}/sync/download-asset`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ stage, token, key }),
  });
}

function getFileType(contentType: string | undefined) {
  if (!contentType) return "unknown";
  if (contentType.startsWith("image/")) return "image";
  if (contentType.startsWith("video/")) return "video";
  if (contentType.startsWith("audio/")) return "audio";
  if (contentType.startsWith("text/")) return "text";
  if (contentType.includes("javascript") || contentType.includes("json"))
    return "code";
  if (contentType.includes("zip") || contentType.includes("compressed"))
    return "archive";
  return "other";
}

function getFileIcon(type: string) {
  switch (type) {
    case "image":
      return ImageIcon;
    case "video":
      return VideoIcon;
    case "audio":
      return AudioLines;
    case "text":
      return FileTextIcon;
    case "code":
      return FileCodeIcon;
    case "archive":
      return FolderArchive;
    default:
      return FileIcon;
  }
}

function formatFileSize(bytes: number) {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export const AssetsList = ({
  useSyncForDownload,
}: {
  useSyncForDownload?: boolean;
}) => {
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 500);
  const { stage } = useApiClientContext();
  const [urlParams, setUrlParams] = useState({
    width: "",
    height: "",
    format: "original",
    quality: "80",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const apiClient = useApiClient();
  const [paginationToken, setPaginationToken] = useState<string>();
  const [hasMore, setHasMore] = useState(true);
  const {
    data,
    loading: assetsLoading,
    refetch,
  } = useAssets({
    search: debouncedSearchQuery,
    limit: PageLimit,
    startAfter: paginationToken,
  });
  const { mutate: uploadAsset, loading: uploading } = useUploadAsset();
  const { mutate: deleteAsset, loading: deleting } = useDeleteAsset();
  const [downloadingAsset, setDownloadingAsset] = useState<string | null>(null);
  const assets = data?.assets;

  const handleDelete = async (key: string) => {
    try {
      await deleteAsset(key);
      refetch();
      setItemToDelete(null);
    } catch (error) {
      console.error("Failed to delete asset:", error);
    }
  };

  const handleDownload = async (key: string) => {
    try {
      setDownloadingAsset(key);
      if (useSyncForDownload) {
        await downloadAsset(stage!, getAuthToken()!, key);
      } else {
        const asset = assets?.find((a) => a.key === key);
        if (!asset) {
          throw new Error("Asset not found");
        }

        // Get the download URL from the API client
        const url = apiClient.getAssetUrl(key);

        // Create a temporary anchor element to trigger the download
        const link = document.createElement("a");
        link.href = url;

        // Extract filename from the key (last part after the last slash)
        const filename = key.split("/").pop() || "download";
        link.download = filename;

        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Failed to download asset:", error);
    } finally {
      setDownloadingAsset(null);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadAsset(file);
      refetch();
      e.target.value = ""; // Reset the input
    } catch (error) {
      console.error("Failed to upload file:", error);
    }
  };

  const handleLoadMore = () => {
    if (assets && assets.length > 0) {
      const lastAsset = assets[assets.length - 1];
      setPaginationToken(lastAsset.key);
    }
  };

  useEffect(() => {
    // Reset pagination when search changes
    setPaginationToken(undefined);
    setHasMore(true);
  }, [debouncedSearchQuery]);

  useEffect(() => {
    // Update hasMore flag based on returned results
    if (data?.assets && data.assets.length < PageLimit) {
      setHasMore(false);
    } else {
      setHasMore(true);
    }
  }, [data?.assets]);

  if (assetsLoading && !paginationToken) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <div className="flex flex-row items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Assets</h1>
        <div className="flex items-center gap-4">
          <div className="w-64">
            <Input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              className="w-full"
            />
          </div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {uploading ? "Uploading..." : "Upload File"}
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {!assets?.length && !uploading && (
        <div className="text-center mt-8">
          <p className="mb-4">No assets found</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {assets?.map((asset) => {
          const fileType = getFileType(asset.httpMetadata?.contentType);
          const Icon = getFileIcon(fileType);

          return (
            <Card
              key={asset.key}
              className="p-4 flex flex-col gap-2 group hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedAsset(asset)}
            >
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative">
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAsset(asset);
                  }}
                >
                  <Info className="h-4 w-4" />
                </Button>
                {fileType === "image" ? (
                  <img
                    src={apiClient.getAssetUrl(asset.key, {
                      width: 400,
                      height: 400,
                      skipVector: true,
                    })}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                  />
                ) : fileType === "video" ? (
                  <video
                    src={asset.key}
                    className="w-full h-full object-cover"
                    controls
                  />
                ) : fileType === "audio" ? (
                  <>
                    <Icon className="w-12 h-12 text-gray-400" />
                    <audio
                      src={asset.name}
                      controls
                      className="absolute bottom-0 w-full"
                    />
                  </>
                ) : (
                  <Icon className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <div className="font-medium truncate" title={asset.name}>
                  {asset.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {formatFileSize(asset.size)}
                </div>
              </div>
              <div className="flex flex-row gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setItemToDelete(asset.key);
                  }}
                  disabled={deleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDownload(asset.key);
                  }}
                  disabled={downloadingAsset === asset.key}
                >
                  {downloadingAsset === asset.key ? (
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {hasMore && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadMore}
            disabled={assetsLoading}
          >
            {assetsLoading ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}

      <Dialog
        open={!!selectedAsset}
        onOpenChange={() => setSelectedAsset(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Asset Information</DialogTitle>
            <DialogDescription>
              Details and URL options for {selectedAsset?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Asset Details</Label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Name:</div>
                <div>{selectedAsset?.name}</div>
                <div>Size:</div>
                <div>{formatFileSize(selectedAsset?.size ?? 0)}</div>
                <div>Type:</div>
                <div>{selectedAsset?.httpMetadata?.contentType}</div>
                {selectedAsset?.metadata?.width &&
                  selectedAsset?.metadata?.height && (
                    <>
                      <div>Dimensions:</div>
                      <div>
                        {selectedAsset.metadata.width} ×{" "}
                        {selectedAsset.metadata.height}px
                      </div>
                    </>
                  )}
                <div>Key:</div>
                <div>{selectedAsset?.key}</div>
              </div>
            </div>

            {selectedAsset &&
              getFileType(selectedAsset.httpMetadata?.contentType) ===
                "image" && (
                <>
                  <div className="grid gap-2">
                    <Label>Image Options</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Width</Label>
                        <Input
                          type="number"
                          placeholder="Auto"
                          value={urlParams.width}
                          onChange={(e) =>
                            setUrlParams({
                              ...urlParams,
                              width: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Height</Label>
                        <Input
                          type="number"
                          placeholder="Auto"
                          value={urlParams.height}
                          onChange={(e) =>
                            setUrlParams({
                              ...urlParams,
                              height: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Format</Label>
                        <Select
                          value={urlParams.format}
                          onValueChange={(value) =>
                            setUrlParams({ ...urlParams, format: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="original">Original</SelectItem>
                            <SelectItem value="webp">WebP</SelectItem>
                            <SelectItem value="jpeg">JPEG</SelectItem>
                            <SelectItem value="png">PNG</SelectItem>
                            <SelectItem value="avif">AVIF</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Quality</Label>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={urlParams.quality}
                          onChange={(e) =>
                            setUrlParams({
                              ...urlParams,
                              quality: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Generated URL</Label>
                    <div className="relative">
                      <Input
                        readOnly
                        value={
                          selectedAsset
                            ? apiClient.getAssetUrl(selectedAsset.key, {
                                width: urlParams.width
                                  ? Number(urlParams.width)
                                  : undefined,
                                height: urlParams.height
                                  ? Number(urlParams.height)
                                  : undefined,
                                format:
                                  urlParams.format !== "original"
                                    ? (urlParams.format as
                                        | "webp"
                                        | "jpeg"
                                        | "png"
                                        | "avif")
                                    : undefined,
                                quality: Number(urlParams.quality),
                              })
                            : ""
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1"
                        onClick={() => {
                          if (!selectedAsset) return;
                          navigator.clipboard.writeText(
                            apiClient.getAssetUrl(selectedAsset.key, {
                              width: urlParams.width
                                ? Number(urlParams.width)
                                : undefined,
                              height: urlParams.height
                                ? Number(urlParams.height)
                                : undefined,
                              format:
                                urlParams.format !== "original"
                                  ? (urlParams.format as
                                      | "webp"
                                      | "jpeg"
                                      | "png"
                                      | "avif")
                                  : undefined,
                              quality: Number(urlParams.quality),
                            })
                          );
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}

            {selectedAsset &&
              getFileType(selectedAsset.httpMetadata?.contentType) !==
                "image" && (
                <div className="space-y-2">
                  <Label>Asset URL</Label>
                  <div className="relative">
                    <Input
                      readOnly
                      value={
                        selectedAsset
                          ? apiClient.getAssetUrl(selectedAsset.key)
                          : ""
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1"
                      onClick={() => {
                        if (!selectedAsset) return;
                        navigator.clipboard.writeText(
                          apiClient.getAssetUrl(selectedAsset.key)
                        );
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={() => setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              asset.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => itemToDelete && handleDelete(itemToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
