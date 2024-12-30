import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCollection, useEntries, useDeleteEntry, useApiClient } from "./useApi";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { capitalizeFirstLetter } from "./utils";
import { Where } from "../filters";
import { FilterUI } from "./Filters";
import { FileIcon, Link2Icon, ExternalLink } from "lucide-react";
import { isImageJsonSchema, isMarkdownJsonSchema, isRichTextJsonSchema } from "../schemas";
import Markdown from "react-markdown";
import { Badge } from "./ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

export const EntriesList = ({ linkPrefix }: { linkPrefix?: string }) => {
  const { collection } = useParams();
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [filter, setFilter] = useState<Where<any>>({});
  const apiClient = useApiClient();

  const { data, loading: collectionLoading } = useCollection(collection);
  const { collection: currentCollection } = data ?? {};
  const {
    data: entries,
    loading: entriesLoading,
    refetch: refetchEntries,
  } = useEntries(collection, filter);
  const { mutate: deleteEntry } = useDeleteEntry(collection);

  const handleDelete = async (id: string) => {
    try {
      await deleteEntry(id);
      refetchEntries();
      setItemToDelete(null);
    } catch (error) {
      console.error("Failed to delete entry:", error);
    }
  };

  // Get schema properties for columns
  const schemaProperties =
    currentCollection?.schema && "properties" in currentCollection.schema
      ? currentCollection.schema.properties ?? {}
      : {};
  const columns = Object.keys(schemaProperties);

  const idField = currentCollection?.idField;

  const renderCellValue = (value: any, schema: any) => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? "Yes" : "No";

    // Handle numbers
    if (typeof value === "number") {
      if (schema?.format === "currency") {
        return (
          <span className="font-medium tabular-nums">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(value)}
          </span>
        );
      }
      if (schema?.format === "percentage") {
        return (
          <span className="font-medium tabular-nums">
            {new Intl.NumberFormat("en-US", {
              style: "percent",
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            }).format(value / 100)}
          </span>
        );
      }
      return (
        <span className="font-medium tabular-nums">
          {new Intl.NumberFormat("en-US").format(value)}
        </span>
      );
    }

    // Handle strings
    if (typeof value === "string") {
      if (schema?.format === "email") {
        return (
          <a
            href={`mailto:${value}`}
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {value}
          </a>
        );
      }
      if (schema?.format === "url") {
        try {
          const urlObj = new URL(value);
          return (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="link"
                  className="h-auto p-0 text-primary hover:no-underline"
                >
                  {urlObj.hostname}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Open URL</p>
                  <p className="text-xs text-muted-foreground break-all">
                    {value}
                  </p>
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      className="gap-1.5"
                      onClick={() => window.open(value, "_blank")}
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open in new tab
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          );
        } catch (e) {
          return <span className="text-muted-foreground">{value}</span>;
        }
      }
      if (value.length > 100) {
        return (
          <span className="text-sm text-muted-foreground" title={value}>
            {value.substring(0, 100)}...
          </span>
        );
      }
    }

    // Handle dates
    if (schema?.format === "date-time" || schema?.type === "date") {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return (
            <time dateTime={date.toISOString()} className="text-sm tabular-nums">
              {new Intl.DateTimeFormat("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(date)}
            </time>
          );
        }
      } catch (e) {
        console.warn("Failed to parse date:", value);
      }
    }

    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length === 0)
        return <span className="text-muted-foreground">Empty array</span>;

      return (
        <div className="flex flex-wrap gap-1.5 max-w-md">
          {value.map((item, index) => (
            <Badge key={index}>{String(item)}</Badge>
          ))}
        </div>
      );
    }

    if (typeof value === "object") {
      if (value.collection && value.id) {
        // Reference
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center bg-muted rounded">
              <Link2Icon className="w-4 h-4" />
            </div>
            <Link
              to={`${linkPrefix ?? ""}/collections/${value.collection}/${
                value.id
              }`}
              className="truncate max-w-xs hover:underline"
              title={`${value.collection}/${value.id}`}
            >
              {value.id}
            </Link>
          </div>
        );
      }
      if (isMarkdownJsonSchema(schema)) {
        const preview = value.markdown.substring(0, 100).replace(/[#*`]/g, '');
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="link"
                className="h-auto p-0 text-left font-normal"
              >
                <span className="line-clamp-2 text-sm">
                  {preview}
                  {value.markdown.length > 100 && "..."}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[32rem] p-4">
              <div className="prose prose-sm dark:prose-invert max-h-[60vh] overflow-y-auto">
                <Markdown>{value.markdown}</Markdown>
              </div>
            </PopoverContent>
          </Popover>
        );
      }
      if (isRichTextJsonSchema(schema)) {
        const preview = value.richText.replace(/<[^>]+>/g, '').substring(0, 100);
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="link"
                className="h-auto p-0 text-left font-normal"
              >
                <span className="line-clamp-2 text-sm">
                  {preview}
                  {value.richText.length > 100 && "..."}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[32rem] p-4">
              <div 
                className="prose prose-sm dark:prose-invert max-h-[60vh] overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: value.richText }}
              />
            </PopoverContent>
          </Popover>
        );
      }
      if (isImageJsonSchema(schema)) {
        const url = apiClient.getAssetUrl(value.key);
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 relative bg-muted rounded overflow-hidden">
              <img
                src={url}
                alt={value.alt}
                className="object-cover w-full h-full"
              />
            </div>
            <span className="truncate max-w-xs" title={value.alt}>
              {value.alt || "No alt text"}
            </span>
          </div>
        );
      }
      if (value.url) {
        // File
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center bg-muted rounded">
              <FileIcon className="w-4 h-4" />
            </div>
            <span className="truncate max-w-xs" title={value.url}>
              {value.url.split("/").pop()}
            </span>
          </div>
        );
      }
      // For other objects, show truncated JSON
      const jsonStr = JSON.stringify(value, null, 2);
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="link"
              className="h-auto p-0 text-left font-normal"
            >
              <span className="line-clamp-2 text-sm font-mono">
                {jsonStr.substring(0, 100)}
                {jsonStr.length > 100 && "..."}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[32rem] p-4">
            <pre className="text-xs font-mono bg-muted p-4 rounded-lg overflow-x-auto max-h-[60vh]">
              {jsonStr}
            </pre>
          </PopoverContent>
        </Popover>
      );
    }

    return (
      <span className="truncate max-w-xs block" title={String(value)}>
        {String(value)}
      </span>
    );
  };

  const isLoading = collectionLoading || entriesLoading;
  // if (collectionLoading || entriesLoading) return <div>Loading...</div>;
  if (!currentCollection) return <div>Collection not found</div>;

  return (
    <div>
      <div className="flex flex-row items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">
          {capitalizeFirstLetter(currentCollection.name)}
        </h1>
        <div className="flex flex-row gap-2 items-center">
          <FilterUI collection={currentCollection} onFilterChange={setFilter} />
          <Button size="sm" className="h-8">
            <Link to={`${linkPrefix ?? ""}/collections/${collection}/new`}>
              New Entry
            </Link>
          </Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column}>
                {capitalizeFirstLetter(column)} {column === idField && "(ID)"}
              </TableHead>
            ))}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && !entries?.entries.length && (
            <>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell>
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </TableCell>
                  {columns.map((_, colIndex) => (
                    <TableCell key={`skeleton-cell-${colIndex}`}>
                      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex gap-2">
                      <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </>
          )}
          {idField &&
            entries?.entries?.map((entry) => (
              <TableRow key={entry[idField]}>
                {/* <TableCell>{entry[idField]}</TableCell> */}
                {columns.map((column) => (
                  <TableCell key={column}>
                    {renderCellValue(entry[column], schemaProperties[column])}
                  </TableCell>
                ))}
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="link" asChild>
                      <Link
                        to={`${linkPrefix ?? ""}/collections/${collection}/${
                          entry[idField]
                        }`}
                      >
                        Edit
                      </Link>
                    </Button>
                    <AlertDialog
                      open={itemToDelete === entry[idField]}
                      onOpenChange={(open) => {
                        if (!open) setItemToDelete(null);
                      }}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          onClick={() => setItemToDelete(entry[idField])}
                        >
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Entry</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this entry? This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(entry[idField])}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};
