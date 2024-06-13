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
import { useConfig, useTree } from "../Context";
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
} from "@/components/ui/alert-dialog";
import s from "./style.module.css";
import { useNavigate } from "react-router-dom";

export function BranchSelector() {
  const [open, setOpen] = useState(false);
  const {
    tree: selectedTree,
    selectTree,
    availableTrees,
    refetchTrees,
  } = useTree();
  const config = useConfig();
  const navigate = useNavigate()

  return (
    <div className={s.Container}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={s.JustifyBetween}
          >
            {selectedTree
              ? selectedTree?.alias ?? selectedTree?.id
              : "Select branch..."}
            <ChevronsUpDown className={s.Chevrons} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={s.NoPad}>
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
                      selectTree(
                        currentValue === selectedTree?.id ? null : tree
                      );
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        s.Checks,
                        selectedTree?.id === tree.id ? s.Opacity100 : s.Opacity0
                      )}
                    />
                    {tree.alias ?? tree.id}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandGroup>
                <CommandItem
                  value={"~manage"}
                  onSelect={() => {
                    navigate("/branches");
                  }}
                >
                  Manage branches
                </CommandItem>
                <CommandItem
                  value={"~new"}
                  onSelect={async () => {
                    await config.trees.add({
                      id: crypto.randomUUID(),
                      alias: "New branch",
                    });
                    await refetchTrees();
                  }}
                >
                  <Plus className={s.PlusIcon} />
                  Add branch
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedTree && selectedTree.alias !== "main" && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button>Publish (Promote to main)</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will replace all current pages in your main branch with
                those in this branch.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  // replace all pages in main branch with this
                  const pages = await config.pages.list({
                    filters: { treeId: { equals: selectedTree.id } },
                  });
                  const mainBranchData = await config.trees.list({
                    filters: { alias: { equals: "main" } },
                  });
                  const mainBranch = mainBranchData.data[0];
                  if (!mainBranch) {
                    throw new Error("No main branch found");
                  }

                  const existingPages = await config.pages.list({
                    filters: { treeId: { equals: mainBranch.id } },
                  });

                  const existingPagesByPath = existingPages.data.reduce(
                    (acc, page) => {
                      acc[page.path] = page;
                      return acc;
                    },
                    {} as Record<string, any>
                  );

                  for (const page of pages.data) {
                    if (existingPagesByPath[page.path]) {
                      await config.pages.update(
                        existingPagesByPath[page.path].id,
                        {
                          content: page.content,
                          title: page.title,
                        }
                      );
                      delete existingPagesByPath[page.path];
                    } else {
                      await config.pages.add({
                        id: crypto.randomUUID(),
                        treeId: mainBranch.id,
                        path: page.path,
                        content: page.content,
                        title: page.title,
                      });
                    }
                  }

                  for (const page of Object.values(existingPagesByPath)) {
                    await config.pages.remove(page.id);
                  }
                }}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
