import React from "react";
import { Button } from "../ui/button";
import { Plus, Trash2, GripVertical, AlertCircle } from "lucide-react";

export const ArrayInput = React.forwardRef<
  HTMLDivElement,
  {
    value: any[];
    onChange: (value: any[]) => void;
    renderItem: (value: any, onChange: (value: any) => void) => React.ReactNode;
    minItems?: number;
    maxItems?: number;
    defaultValue?: any;
  }
>(({ value = [], onChange, renderItem, minItems, maxItems, defaultValue = "" }, ref) => {
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dropIndex, setDropIndex] = React.useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnter = (index: number) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      setDropIndex(index);
    }
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dropIndex !== null) {
      const newItems = [...value];
      const [draggedItem] = newItems.splice(draggedIndex, 1);
      newItems.splice(dropIndex, 0, draggedItem);
      onChange(newItems);
    }
    setDraggedIndex(null);
    setDropIndex(null);
  };

  const canRemove = !minItems || value.length > minItems;
  const canAdd = !maxItems || value.length < maxItems;

  return (
    <div ref={ref} className="space-y-4">
      <div className="space-y-2">
        {value.map((item, index) => (
          <div
            key={index}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            className="flex items-start gap-2 p-4 rounded-lg border bg-card"
          >
            <Button
              variant="ghost"
              size="icon"
              className="cursor-grab shrink-0 text-muted-foreground"
            >
              <GripVertical className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              {renderItem(item, (newValue) => {
                const newItems = [...value];
                newItems[index] = newValue;
                onChange(newItems);
              })}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={
                canRemove
                  ? "text-destructive"
                  : "text-muted-foreground opacity-50"
              }
              disabled={!canRemove}
              onClick={() => {
                const newItems = [...value];
                newItems.splice(index, 1);
                onChange(newItems);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full"
          disabled={!canAdd}
          onClick={() => onChange([...value, defaultValue])}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
        {(minItems || maxItems) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="w-4 h-4" />
            {minItems && maxItems
              ? `This field requires between ${minItems} and ${maxItems} items`
              : minItems
              ? `This field requires at least ${minItems} item${
                  minItems === 1 ? "" : "s"
                }`
              : maxItems
              ? `This field accepts up to ${maxItems} item${
                  maxItems === 1 ? "" : "s"
                }`
              : null}
          </div>
        )}
      </div>
    </div>
  );
});

ArrayInput.displayName = "ArrayInput";
