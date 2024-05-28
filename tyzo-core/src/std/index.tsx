import { Stack } from "./Stack";
import { Heading } from "./Heading";
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
import { withCss } from "@tyzo/page-editor";
import type {
  EditorInput,
  PageElement,
  ElementContainer,
  InputMap,
  ComponentInfo,
  StringProperty,
} from "@tyzo/page-editor";

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
            className="mx-2"
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
            className="mx-2"
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
  [x: string]: ComponentInfo;
} = {
  heading: withCss(
    {
      id: "heading",
      name: "Heading",
      groupName: "Typography",
      properties: {
        children: { type: "string", name: "children", defaultData: "Heading" },
        size: {
          name: "size",
          type: "string",
          enum: ["h1", "h2", "h3", "h4", "h5", "h6"],
          defaultData: "h1",
          // options: [
          //   { value: "h1", label: "H1" },
          //   { value: "h2", label: "H2" },
          //   { value: "h3", label: "H3" },
          //   { value: "h4", label: "H4" },
          //   { value: "h5", label: "H5" },
          //   { value: "h6", label: "H6" },
          // ],
        },
      },
      component: Heading,
    },
    [{ fontSize: "1.5em" }, { fontWeight: "bold" }]
  ),
  paragraph: withCss({
    id: "paragraph",
    name: "Paragraph",
    groupName: "Typography",
    properties: {
      children: { name: "children", type: "string", defaultData: "" },
    },
    component: Paragraph,
  }),
  stack: withCss({
    id: "stack",
    name: "Stack",
    groupName: "Layout",
    properties: {
      children: { name: "children", type: "children", defaultData: undefined },
      direction: {
        name: "direction",
        type: "string",
        defaultData: "horizontal",
        enum: [
          "horizontal",
          "vertical",
          // { value: "horizontal", label: "Horizontal" },
          // { value: "vertical", label: "Vertical" },
        ],
      },
      gap: {
        name: "gap",
        type: "string",
        defaultData: "",
      },
      justifyContent: {
        name: "justifyContent",
        type: "string",
        enum: [
          "flex-start",
          "flex-end",
          "center",
          "space-between",
          "space-evenly",
        ],
        defaultData: "flex-start",
      },
      alignItems: {
        name: "alignItems",
        type: "string",
        enum: ["flex-start", "flex-end", "center", "baseline", "stretch"],
        defaultData: "flex-start",
      },
    },
    component: (props) => {
      return <Stack {...props}>{props.children}</Stack>;
    },
  }),
  section: withCss({
    id: "section",
    name: "Section",
    groupName: "Layout",
    properties: {
      id: { name: "id", type: "string", defaultData: undefined },
      children: { name: "children", type: "children", defaultData: undefined },
    },
    component: (props) => {
      return <section id={props.id}>{props.children}</section>;
    },
  }),
  link: withCss({
    id: "link",
    name: "Link",
    groupName: "Typography",
    properties: {
      children: { name: "children", type: "children", defaultData: undefined },
      href: { name: "href", type: "string", defaultData: "" },
    },
    component: (props) => {
      return <a href={props.href}>{props.children}</a>;
    },
  }),
  card: withCss({
    id: "card",
    name: "Card",
    groupName: "Layout",
    properties: {
      children: { name: "children", type: "children", defaultData: undefined },
      title: { name: "title", type: "string", defaultData: "" },
      description: { name: "description", type: "string", defaultData: "" },
    },
    component: (props) => {
      return (
        <Card>
          {(props.title || props.description) && (
            <CardHeader>
              {props.title && <CardTitle>{props.title}</CardTitle>}
              {props.description && (
                <CardDescription>{props.description}</CardDescription>
              )}
            </CardHeader>
          )}
          {props.children && <CardContent>{props.children}</CardContent>}
          {/* <CardFooter>
          </CardFooter> */}
        </Card>
      );
    },
  }),

  image: withCss({
    id: "image",
    name: "Image",
    groupName: "Media",
    properties: {
      src: {
        name: "src",
        type: "image",
        defaultData: undefined,
      },
      width: { name: "width", type: "number", defaultData: undefined },
      height: { name: "height", type: "number", defaultData: undefined },
    },
    component: ({
      src,
      width,
      height,
    }: {
      src: string;
      width: number;
      height: number;
    }) => {
      return <img src={src} width={width} height={height} />;
    },
  }),
};

export const ImageProps: EditorInput<{
  property: StringProperty;
  element: PageElement;
  elementContainer: ElementContainer;
  components: ComponentInfo[];
  inputs: InputMap;
  value: any;
  setValue: (value: any) => void;
}> = function ImageProps(props) {
  return (
    <Image
      value={props.value}
      onChange={(value) => props.setValue(value as any)}
    />
  );
};
