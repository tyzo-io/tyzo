import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCollection, useEntries, useDeleteEntry } from "./useApi";
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
import { FileIcon, Link2Icon } from "lucide-react";

export const EntriesList = ({ linkPrefix }: { linkPrefix?: string }) => {
  const { collection } = useParams();
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [filter, setFilter] = useState<Where<any>>({});

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

    if (typeof value === "object") {
      if (value.collection && value.id) {
        // Reference
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center bg-muted rounded">
              <Link2Icon className="w-4 h-4" />
            </div>
            <Link
              to={`/collections/${value.collection}/${value.id}`}
              className="truncate max-w-xs hover:underline"
              title={`${value.collection}/${value.id}`}
            >
              {value.id}
            </Link>
          </div>
        );
      }
      if (value.url) {
        const url = value.url;
        if (value.alt !== undefined) {
          // Image
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
        } else {
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
      }
      return (
        <span className="truncate max-w-xs" title={JSON.stringify(value)}>
          {JSON.stringify(value)}
        </span>
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
    <div className="p-4">
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
                <TableCell className="flex gap-2">
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
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};
