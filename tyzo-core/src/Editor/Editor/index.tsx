import { Editor, CssEdit } from "@tyzo/page-editor";
import type { Config, Page } from "@tyzo/page-editor";
import "@tyzo/page-editor/dist/style.css";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useConfig } from "../Context";
import { useData } from "@/lib/useData";
import { ImageProps } from "@/std";
import { Button } from "@/components/ui/button";
import { Loader2, MoveLeft } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import s from "./style.module.css";

export const editorConfig: Config = {
  components: {},
};

const initialData: Page = {
  id: "new",
  name: "Page",
  path: "/",
  title: "",
  children: [],
  elements: {},
};

export function PageEditor() {
  const config = useConfig();
  const { id } = useParams();
  const { data, isLoading } = useData(
    async () => (id ? await config.pages.get(id) : null),
    [id]
  );

  const [components, setComponents] = useState<
    Record<string, any> | undefined
  >();
  useEffect(() => {
    import(config.componentsImportPath).then(({ default: components }) => {
      setComponents(components);
    });
  }, [config.componentsImportPath]);
  const [pageDetails, setPageDetails] = useState<{
    path: string;
    title: string;
  }>();
  const [pageDetailsIsOpen, setPageDetailsIsOpen] = useState(false);
  const [pageDetailsIsSaving, setPageDetailsIsSaving] = useState(false);

  if (isLoading || !components) {
    return <div>Loading</div>;
  }
  if (!data) {
    return <div>Page not found</div>;
  }

  const editorData = (data.content as Page) ?? initialData;
  return (
    <Editor
      config={{
        ...editorConfig,
        async save(data) {
          if (!id) {
            return;
          }
          await config.pages.update(id, {
            content: data,
          });
        },
        components: {
          ...editorConfig.components,
          ...components,
        },
        additionalInputs: {
          css: CssEdit,
          image: ImageProps,
        },
        headerLeft: (
          <Button variant="link" asChild>
            <Link to="/">
              <MoveLeft className={s.BackButton} /> Back
            </Link>
          </Button>
        ),
        headerRight: (
          <Popover open={pageDetailsIsOpen} onOpenChange={setPageDetailsIsOpen}>
            <PopoverTrigger>
              {pageDetails?.title ?? data.title}{" "}
              <code>{pageDetails?.path ?? data.path}</code>
            </PopoverTrigger>
            <PopoverContent style={{ padding: "0.5em" }}>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();

                  if (!id || !pageDetails) {
                    return;
                  }
                  setPageDetailsIsSaving(true);
                  await config.pages.update(id, {
                    title: pageDetails.title,
                    path: pageDetails.path,
                  });
                  setPageDetailsIsSaving(false);
                  setPageDetailsIsOpen(false);
                }}
              >
                <Label>Title</Label>
                <Input
                  value={pageDetails?.title ?? data.title}
                  onChange={(e) => {
                    setPageDetails({
                      title: e.target.value,
                      path: pageDetails?.path ?? data.path,
                    });
                  }}
                />
                <Label className={s.Path}>Path</Label>
                <Input
                  value={pageDetails?.path ?? data.path}
                  onChange={(e) => {
                    setPageDetails({
                      path: e.target.value,
                      title: pageDetails?.title ?? data.title,
                    });
                  }}
                />
                <Button
                  type="submit"
                  disabled={pageDetailsIsSaving}
                  className={s.Submit}
                >
                  {pageDetailsIsSaving ? (
                    <Loader2 className={s.Spinner} />
                  ) : (
                    "Save"
                  )}
                </Button>
              </form>
            </PopoverContent>
          </Popover>
        ),
      }}
      initialPage={{
        ...editorData,
      }}
    />
  );
}
