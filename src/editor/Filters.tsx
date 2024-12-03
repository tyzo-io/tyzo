import React, { useState } from "react";
import { Button } from "./ui/button";
import { capitalizeFirstLetter } from "./utils";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Comparators, Where } from "../filters";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Filter, X } from "lucide-react";
import { Badge } from "./ui/badge";
import { SerializedCollection } from "../localServer";

type FilterCondition = {
  field: string;
  operator: keyof Comparators<any>;
  value: string;
};

const operatorLabels: Record<keyof Comparators<any>, string> = {
  $eq: "Equals",
  $gt: "Greater than",
  $gte: "Greater than or equal",
  $lt: "Less than",
  $lte: "Less than or equal",
  $ne: "Not equal",
  $in: "In list",
  $nin: "Not in list",
  $all: "Contains all",
  $not: "Not",
  $exists: "Exists",
  $regex: "Matches pattern",
  $options: "Options",
};

export const FilterUI = ({
  collection,
  onFilterChange,
}: {
  collection: SerializedCollection;
  onFilterChange: (filter: Where<any>) => void;
}) => {
  const [conditions, setConditions] = useState<FilterCondition[]>([]);
  const [open, setOpen] = useState(false);

  const properties =
    "properties" in collection.schema ? collection.schema.properties : {};

  const addCondition = () => {
    setConditions([
      ...conditions,
      {
        field: Object.keys(properties)[0],
        operator: "$eq",
        value: "",
      },
    ]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (
    index: number,
    field: keyof FilterCondition,
    value: string
  ) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    setConditions(newConditions);
  };

  const buildFilter = (): Where<any> => {
    const filter: Where<any> = {};
    conditions.forEach((condition) => {
      if (!condition.value && condition.operator !== "$exists") return;

      let value: any = condition.value;
      if (condition.operator === "$exists") {
        value = condition.value === "true";
      } else if (
        condition.operator === "$in" ||
        condition.operator === "$nin" ||
        condition.operator === "$all"
      ) {
        value = condition.value.split(",").map((v) => v.trim());
      } else if (
        "type" in properties[condition.field] &&
        (properties[condition.field] as { type: string }).type === "number"
      ) {
        value = Number(condition.value);
      }

      filter[condition.field] = { [condition.operator]: value };
    });
    return filter;
  };

  const applyFilter = () => {
    onFilterChange(buildFilter());
    setOpen(false);
  };

  const clearFilter = () => {
    setConditions([]);
    onFilterChange({});
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-8 px-2">
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {conditions.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {conditions.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-4">
        <div className="space-y-4">
          {conditions.map((condition, index) => (
            <div key={index} className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Filter {index + 1}</Label>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => removeCondition(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Select
                value={condition.field}
                onValueChange={(value) =>
                  updateCondition(index, "field", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(properties).map(
                    ([key, prop]: [string, any]) => (
                      <SelectItem key={key} value={key}>
                        {capitalizeFirstLetter(key)} ({prop.type})
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              <Select
                value={condition.operator}
                onValueChange={(value) =>
                  updateCondition(
                    index,
                    "operator",
                    value as keyof Comparators<any>
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(operatorLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {condition.operator !== "$exists" && (
                <Input
                  placeholder="Value"
                  value={condition.value}
                  onChange={(e) =>
                    updateCondition(index, "value", e.target.value)
                  }
                />
              )}
              {condition.operator === "$exists" && (
                <Select
                  value={condition.value}
                  onValueChange={(value) =>
                    updateCondition(index, "value", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
          <div className="flex justify-between">
            <Button variant="outline" onClick={addCondition}>
              Add Filter
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={clearFilter}>
                Clear
              </Button>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  applyFilter();
                }}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
