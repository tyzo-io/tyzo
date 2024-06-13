import { Stack } from "./Stack";
import { Heading } from "./Heading";
import { Paragraph } from "./Paragraph";
import { withCss } from "../CssProps";
import { ComponentInfo } from "../types";

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
      baseRule: {
        name: "baseRule",
        type: "stackBaseRule",
        defaultData: {
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          gap: "",
        },
      },
      additionalRules: {
        name: "additionalRules",
        type: "stackAdditionalRules",
        defaultData: undefined,
      },
    },
    component: (props) => {
      return (
        <Stack {...props} id={props.tyzo.id}>
          {props.children}
        </Stack>
      );
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
  ul: withCss({
    id: "ul",
    name: "Unordered List",
    groupName: "Typography",
    properties: {
      items: {
        name: "items",
        type: "array",
        items: {
          name: "item",
          type: "string",
          defaultData: "",
        },
        defaultItem: "",
        defaultData: [],
      },
    },
    component: (props: { items: string[] }) => {
      return (
        <ul>
          {props.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    },
  }),
  ol: withCss({
    id: "ol",
    name: "Ordered List",
    groupName: "Typography",
    properties: {
      items: {
        name: "items",
        type: "array",
        items: {
          name: "item",
          type: "string",
          defaultData: "",
        },
        defaultItem: "",
        defaultData: [],
      },
    },
    component: (props: { items: string[] }) => {
      return (
        <ol>
          {props.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      );
    },
  }),
  html: withCss({
    id: "html",
    name: "HTML",
    groupName: "Layout",
    properties: {
      content: {
        name: "content",
        type: "string",
        defaultData: "",
      },
    },
    component: (props: { content: string }) => {
      return <div dangerouslySetInnerHTML={{ __html: props.content }}></div>;
    },
  }),
};
