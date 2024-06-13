import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type ComponentInfo } from "@tyzo/page-editor";
import { withCss } from "@tyzo/page-editor/render";
import { StandardComponents as EditorComponents } from "@tyzo/page-editor/standardComponents";

export const StandardComponents: {
  [x: string]: ComponentInfo;
} = {
  ...EditorComponents,
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
      alt: {
        name: "alt",
        type: "string",
        defaultData: undefined,
      },
      width: { name: "width", type: "number", defaultData: undefined },
      height: { name: "height", type: "number", defaultData: undefined },
    },
    component: ({
      src,
      alt,
      width,
      height,
    }: {
      src: string;
      alt: string;
      width: number;
      height: number;
    }) => {
      return <img src={src} width={width} height={height} alt={alt} />;
    },
  }),
};
