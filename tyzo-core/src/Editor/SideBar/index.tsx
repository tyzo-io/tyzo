import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useData } from "@/lib/useData";
import { useConfig, useTree } from "../Context";
import { BranchSelector } from "../BranchSelector";
import { Link } from "react-router-dom";
import s from "./style.module.css";

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
    <div className={s.Container}>
      <Avatar>
        {/* <AvatarImage src="https://github.com/shadcn.png" /> */}
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <BranchSelector />
      {/* <p className="text-muted-foreground text-sm font-bold">Connections</p> */}
      <p className={s.Title}>Pages</p>
      {data?.data?.map((page) => (
        <div key={page.id}>
          <Link to={`/pages/${page.id}`}>
            <span className={s.PageTitle}>{page.title}</span>{" "}
            <code>{page.path}</code>
          </Link>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        className={s.Button}
        disabled={!tree}
        onClick={async () => {
          await config.pages.add({
            id: crypto.randomUUID(),
            treeId: tree!.id,
            title: "New Page",
            path: "/new-page",
            content: {
              id: crypto.randomUUID(),
              children: [],
              elements: {},
            },
          });
          await refetch();
        }}
      >
        <Plus className={s.Icon} />
      </Button>
      {/* <p className="text-muted-foreground text-sm font-bold">Media</p> */}
    </div>
  );
}
