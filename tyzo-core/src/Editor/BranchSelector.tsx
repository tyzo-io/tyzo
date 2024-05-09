import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useConfig, useTree } from "./Context";

export function BranchSelector() {
  const [open, setOpen] = useState(false);
  const {
    tree: selectedTree,
    selectTree,
    availableTrees,
    refetchTrees,
  } = useTree();
  const config = useConfig();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between"
        >
          {selectedTree
            ? selectedTree?.alias ?? selectedTree?.id
            : "Select branch..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandList>
            <CommandInput placeholder="Search branch..." />
            <CommandEmpty>No branches found.</CommandEmpty>
            <CommandGroup>
              {availableTrees?.map((tree) => (
                <CommandItem
                  key={tree.id}
                  value={tree.id}
                  onSelect={(currentValue) => {
                    selectTree(currentValue === selectedTree?.id ? null : tree);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedTree?.id === tree.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {tree.alias ?? tree.id}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup>
              <div className="flex items-center justify-center">
                <Button
                  onClick={async () => {
                    await config.trees.add({
                      id: crypto.randomUUID(),
                      alias: "New branch",
                    });
                    await refetchTrees();
                  }}
                >
                  <Plus className={cn("mr-2 h-4 w-4")} />
                  Add a branch
                </Button>
              </div>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
