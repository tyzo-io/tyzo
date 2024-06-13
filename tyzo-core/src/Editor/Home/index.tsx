import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { useData } from "@/lib/useData";
import { useConfig, useTree } from "../Context";
import { Link } from "react-router-dom";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { NavBar } from "../NavBar";
import { cn } from "@/lib/utils";
import s from "./style.module.css";

export function Home() {
  const config = useConfig();
  const { tree } = useTree();
  const { data, refetch } = useData(
    () =>
      tree
        ? config.pages.list({ filters: { treeId: { equals: tree.id } } })
        : Promise.resolve({ data: [] }),
    [tree?.id]
  );

  return (
    <div className={cn("tyzo", s.Container)}>
      <NavBar withBranchSelector />
      {/* <p className="text-muted-foreground text-sm font-bold">Connections</p> */}
      <p className={s.Title}>Pages</p>
      <div className={s.grid}>
        {data?.data?.map((page) => (
          <Card key={page.id}>
            <Link to={`/pages/${page.id}`}>
              <CardHeader>
                <CardTitle>{page.title}</CardTitle>
                <CardDescription>
                  <code>{page.path}</code>
                </CardDescription>
              </CardHeader>
            </Link>
            <CardFooter>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Trash className={s.trash} />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      this page.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async () => {
                        await config.pages.remove(page.id);
                        refetch();
                      }}
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
        <Button
          variant="outline"
          // size="sm"
          className={s.addButton}
          disabled={!tree}
          onClick={async () => {
            const id = crypto.randomUUID();
            await config.pages.add({
              id: crypto.randomUUID(),
              treeId: tree!.id,
              title: "New Page",
              path: `/new-page-${id.split("-")[0]}`,
              content: {
                id: crypto.randomUUID(),
                children: [],
                elements: {},
              },
            });
            await refetch();
          }}
        >
          <Plus className={s.pagePlusIcon} />
          <CardDescription>Add a new page</CardDescription>
        </Button>
      </div>
      {/* <p className="text-muted-foreground text-sm font-bold">Media</p> */}
    </div>
  );
}
