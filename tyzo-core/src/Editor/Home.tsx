import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useData } from "@/lib/useData";
import { useConfig, useTree } from "./Context";
import { Link } from "react-router-dom";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NavBar } from "./NavBar";

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
    <div className="p-4 container">
      <NavBar withBranchSelector />
      {/* <p className="text-muted-foreground text-sm font-bold">Connections</p> */}
      <p className="text-muted-foreground text-sm font-bold mb-2">Pages</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data?.data?.map((page) => (
          <Link key={page.id} to={`/pages/${page.id}`}>
            <Card>
              <CardHeader>
                <CardTitle>{page.title}</CardTitle>
                <CardDescription>
                  <code>{page.path}</code>
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
        <Button
          variant="outline"
          // size="sm"
          className="h-auto"
          disabled={!tree}
          onClick={async () => {
            const id = crypto.randomUUID();
            await config.pages.add({
              id: crypto.randomUUID(),
              treeId: tree!.id,
              title: "New Page",
              path: `/new-page-${id.split("-")[0]}`,
              content: { root: {}, content: [] },
            });
            await refetch();
          }}
        >
          <Plus className="h-4 w-4 mr-2 text-muted-foreground" />
          <CardDescription>Add a new page</CardDescription>
        </Button>
      </div>
      {/* <p className="text-muted-foreground text-sm font-bold">Media</p> */}
    </div>
  );
}
