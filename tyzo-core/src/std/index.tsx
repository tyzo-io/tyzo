import {
  DropZone,
  type ComponentConfig,
  type ComponentData,
} from "@measured/puck";
import { Stack } from "./Stack";
import { Heading } from "./Heading";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Paragraph } from "./Paragraph";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useConfig } from "@/Editor/Context";
import { withCss } from "@/Editor/CssProps";

function Image({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const config = useConfig();
  return (
    <div>
      <Tabs defaultValue="file">
        <TabsList>
          <TabsTrigger value="file">Upload</TabsTrigger>
          <TabsTrigger value="url">URL</TabsTrigger>
        </TabsList>
        <TabsContent value="file">
          <Input
            type="file"
            disabled={isUploading}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                setIsUploading(true);
                const id = crypto.randomUUID();
                const publicOrPrivate = "public";
                const { url } = await config.fileStore.add(
                  `${publicOrPrivate}/${id}/${file.name}`,
                  file
                );
                onChange(url);
                setIsUploading(false);
              }
            }}
          />
        </TabsContent>
        <TabsContent value="url">
          <Input
            value={value}
            type="url"
            onChange={(e) => onChange(e.target.value)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const StandardComponents: {
  [x: string]: Omit<
    ComponentConfig<any, any, Omit<ComponentData<any>, "type">>,
    "type"
  >;
} = {
  Heading: withCss(
    {
      fields: {
        children: { type: "text", label: "Text" },
        size: {
          type: "select",
          options: [
            { value: "h1", label: "H1" },
            { value: "h2", label: "H2" },
            { value: "h3", label: "H3" },
            { value: "h4", label: "H4" },
            { value: "h5", label: "H5" },
            { value: "h6", label: "H6" },
          ],
        },
      },
      defaultProps: {
        size: "h1",
      },
      render: Heading,
    },
    [{ fontSize: "1.5em" }, { fontWeight: "bold" }]
  ),
  Paragraph: {
    fields: {
      children: { type: "text" },
      textAlign: {
        type: "select",
        options: [
          { value: "left", label: "Left" },
          { value: "center", label: "Center" },
          { value: "right", label: "Right" },
        ],
      },
    },
    render: Paragraph,
  },
  Stack: {
    fields: {
      isContainer: {
        type: "custom",
        render(props) {
          return (
            <Label className="flex flex-row items-center gap-2">
              <Checkbox
                checked={props.value}
                name={props.name}
                onCheckedChange={(checked) =>
                  props.onChange(
                    checked === "indeterminate" ? false : (true as any)
                  )
                }
              />{" "}
              Is Container
            </Label>
          );
        },
      },
      gap: {
        type: "text",
      },
      direction: {
        type: "select",
        options: [
          { value: "horizontal", label: "Horizontal" },
          { value: "vertical", label: "Vertical" },
        ],
      },
      // description: { type: "text" },
    },
    defaultProps: {
      direction: "vertical",
    },
    render: (props) => {
      return (
        <Stack {...props}>
          {props.editMode && (
            <style>{` #${props.id}\\:children {
              display: flex;
              flex-direction: row;
              ${props.gap ? `gap: ${props.gap};` : ""}
            }`}</style>
          )}
          <DropZone zone="children" />
        </Stack>
      );
    },
  },
  Section: {
    fields: {
      id: { type: "text" },
    },
    render: (props) => {
      return (
        <section id={props.id}>
          <DropZone zone="content" />
        </section>
      );
    },
  },
  Link: {
    fields: {
      href: { type: "text" },
    },
    render: (props) => {
      return (
        <a href={props.href}>
          <DropZone zone="content" />
        </a>
      );
    },
  },
  Card: {
    fields: {
      title: { type: "text" },
      description: { type: "text" },
    },
    render: (props) => {
      return (
        <Card>
          <CardHeader>
            <CardTitle>{props.title}</CardTitle>
            {props.description && (
              <CardDescription>{props.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <DropZone zone="content" />
          </CardContent>
          {/* <CardFooter>
            <DropZone zone="footer" />
          </CardFooter> */}
        </Card>
      );
    },
  },

  Image: {
    fields: {
      src: {
        type: "custom",
        render(props) {
          return (
            <Image
              value={props.value}
              onChange={(value) => props.onChange(value as any)}
            />
          );
        },
      },
      width: { type: "number" },
      height: { type: "number" },
    },
    render: (props) => {
      return <img {...props} />;
    },
  },
};
