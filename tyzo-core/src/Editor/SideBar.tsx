import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useData } from "@/lib/useData";
import { useConfig, useTree } from "./Context";
import { BranchSelector } from "./BranchSelector";
import { Link } from "react-router-dom";

export function SideBar() {
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
    <div className="flex flex-col gap-4 p-4">
      <Avatar>
        {/* <AvatarImage src="https://github.com/shadcn.png" /> */}
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <BranchSelector />
      {/* <p className="text-muted-foreground text-sm font-bold">Connections</p> */}
      <p className="text-muted-foreground text-sm font-bold">Pages</p>
      {data?.data?.map((page) => (
        <div key={page.id}>
          <Link to={`/pages/${page.id}`}>
            <span className="font-semibold">{page.title}</span>{" "}
            <code>{page.path}</code>
          </Link>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        className="h-6"
        disabled={!tree}
        onClick={async () => {
          await config.pages.add({
            id: crypto.randomUUID(),
            treeId: tree!.id,
            title: "New Page",
            path: "/new-page",
            content: { root: {}, content: [] },
          });
          await refetch();
        }}
      >
        <Plus className="h-4 w-4" />
      </Button>
      {/* <p className="text-muted-foreground text-sm font-bold">Media</p> */}
    </div>
  );
}
