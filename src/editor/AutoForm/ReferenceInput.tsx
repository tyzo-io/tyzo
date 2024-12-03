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
import { useCollection, useEntries } from "../useApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { capitalizeFirstLetter } from "../utils";
import { Link } from "lucide-react";

export const ReferenceInput = React.forwardRef<
  HTMLInputElement,
  {
    value: {
      id: string | number;
      collection: string;
    };
    onChange: (value: { id: string | number; collection: string }) => void;
    collectionName: string;
  }
>((props, ref) => {
  const { value, onChange, collectionName } = props;
  const [isOpen, setIsOpen] = React.useState(false);

  const { data: collectionData } = useCollection(collectionName);
  const { data: entriesData } = useEntries(collectionName);

  const { collection } = collectionData ?? {};
  const { entries } = entriesData ?? { entries: [] };

  // Get schema properties for columns
  const schemaProperties =
    collection?.schema && "properties" in collection.schema
      ? collection.schema.properties ?? {}
      : {};
  const columns = Object.keys(schemaProperties).filter(
    (key) =>
      typeof schemaProperties[key] !== "object" ||
      !(
        "properties" in schemaProperties[key] &&
        (schemaProperties[key] as any).properties
      )
  );

  const idField = collection?.idField;

  const renderCellValue = (value: any) => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const selectedEntry = entries?.find((entry) => entry[idField!] === value?.id);

  return (
    <div className="flex items-center gap-2">
      <Input
        ref={ref}
        type="text"
        value={selectedEntry ? renderCellValue(selectedEntry[idField!]) : ""}
        readOnly
        placeholder="Select a reference"
      />
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Link className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Select {capitalizeFirstLetter(collectionName)}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column}>
                      {capitalizeFirstLetter(column)}{" "}
                      {column === idField && "(ID)"}
                    </TableHead>
                  ))}
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries?.map((entry) => (
                  <TableRow key={entry[idField!]}>
                    {columns.map((column) => (
                      <TableCell key={column}>
                        {renderCellValue(entry[column])}
                      </TableCell>
                    ))}
                    <TableCell>
                      <Button
                        variant="link"
                        onClick={() => {
                          onChange({
                            id: entry[idField!],
                            collection: collectionName,
                          });
                          setIsOpen(false);
                        }}
                      >
                        Select
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

ReferenceInput.displayName = "ReferenceInput";
