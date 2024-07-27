import { Editor, CssEdit } from "@tyzo/page-editor";
import type { Config, Page } from "@tyzo/page-editor";
import "@tyzo/page-editor/style.css";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useConfig, useEditorConfig } from "../Context";
import { useData } from "@/lib/useData";
import { ImageProps } from "@/std/Inputs";
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
  name: "Email Template",
  path: "/",
  title: "",
  children: [],
  elements: {},
};

export function EmailEditor() {
  const service = useConfig();
  const config = useEditorConfig();
  const { id } = useParams();
  const { data, isLoading } = useData(
    async () => (id ? await service.emailTemplates.get(id) : null),
    [id]
  );

  const [emailDetails, setEmailDetails] = useState<{
    subject: string;
    title: string;
  }>();
  const [emailDetailsIsOpen, setEmailDetailsIsOpen] = useState(false);
  const [emailDetailsIsSaving, setEmailDetailsIsSaving] = useState(false);

  if (isLoading) {
    return <div>Loading</div>;
  }
  if (!data) {
    return <div>Email not found</div>;
  }

  const editorData = (data.content as Page) ?? initialData;
  return (
    <Editor
      // translations={de}
      config={{
        ...editorConfig,
        ...config,
        async save(data) {
          if (!id) {
            return;
          }
          await service.emailTemplates.update(id, {
            content: data,
          });
        },
        components: {
          ...editorConfig.components,
          ...config.components,
        },
        additionalInputs: {
          css: CssEdit,
          image: ImageProps,
          ...config.additionalInputs,
        },
        headerLeft: (
          <Button variant="link" asChild>
            <Link to="/">
              <MoveLeft className={s.BackButton} /> Back
            </Link>
          </Button>
        ),
        headerRight: (
          <>
            <Popover
              open={emailDetailsIsOpen}
              onOpenChange={setEmailDetailsIsOpen}
            >
              <PopoverTrigger>
                {emailDetails?.title ?? data.title}{" "}
                <p>{emailDetails?.subject ?? data.subject}</p>
              </PopoverTrigger>
              <PopoverContent style={{ padding: "0.5em" }}>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();

                    if (!id || !emailDetails) {
                      return;
                    }
                    setEmailDetailsIsSaving(true);
                    await service.emailTemplates.update(id, {
                      title: emailDetails.title,
                      subject: emailDetails.subject,
                    });
                    setEmailDetailsIsSaving(false);
                    setEmailDetailsIsOpen(false);
                  }}
                >
                  <Label>Title</Label>
                  <Input
                    value={emailDetails?.title ?? data.title}
                    onChange={(e) => {
                      setEmailDetails({
                        title: e.target.value,
                        subject: emailDetails?.subject ?? data.subject,
                      });
                    }}
                  />
                  <Label className={s.Path}>Subject</Label>
                  <Input
                    value={emailDetails?.subject ?? data.subject}
                    onChange={(e) => {
                      setEmailDetails({
                        subject: e.target.value,
                        title: emailDetails?.title ?? data.title,
                      });
                    }}
                  />
                  <Button
                    type="submit"
                    disabled={emailDetailsIsSaving}
                    className={s.Submit}
                  >
                    {emailDetailsIsSaving ? (
                      <Loader2 className={s.Spinner} />
                    ) : (
                      "Save"
                    )}
                  </Button>
                </form>
              </PopoverContent>
            </Popover>
            {config.headerRight}
          </>
        ),
      }}
      initialPage={{
        ...editorData,
      }}
    />
  );
}
