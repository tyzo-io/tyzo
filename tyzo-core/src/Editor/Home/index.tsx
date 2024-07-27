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
import s from "./style.module.css";

export function Home() {
  const config = useConfig();
  const { tree } = useTree();
  const { data, refetch } = useData(
    async () =>
      tree
        ? {
            pages: (
              await config.pages.list({
                filters: { treeId: { equals: tree.id } },
              })
            ).data,
            emailTemplates: (
              await config.emailTemplates.list({
                filters: { treeId: { equals: tree.id } },
              })
            ).data,
          }
        : Promise.resolve({ pages: [], emailTemplates: [] }),
    [tree?.id]
  );

  return (
    <div>
      {/* <p className="text-muted-foreground text-sm font-bold">Connections</p> */}
      <div>
        <p className={s.Title}>Pages</p>
        <div className={s.grid}>
          {data?.pages?.map((page) => (
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
                        This action cannot be undone. This will permanently
                        delete this page.
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
      </div>
      <div>
        <p className={s.Title}>Email Templates</p>
        <div className={s.grid}>
          {data?.emailTemplates?.map((email) => (
            <Card key={email.id}>
              <Link to={`/email-templates/${email.id}`}>
                <CardHeader>
                  <CardTitle>{email.title}</CardTitle>
                  <CardDescription>{email.subject}</CardDescription>
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
                        This action cannot be undone. This will permanently
                        delete this email template.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          await config.emailTemplates.remove(email.id);
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
              await config.emailTemplates.add({
                id: crypto.randomUUID(),
                treeId: tree!.id,
                title: "New Email Template",
                subject: `Subject Placeholder`,
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
            <CardDescription>Add a new email template</CardDescription>
          </Button>
        </div>
      </div>
      {/* <p className="text-muted-foreground text-sm font-bold">Media</p> */}
    </div>
  );
}
