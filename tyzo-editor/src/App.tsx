import { withCss } from "./CssProps";
import { Editor } from "./components/Editor";
import { Config } from "./components/Editor/types";
import { CssEdit } from "./lib";
import { RenderTemplate } from "./components/Render/RenderTemplate";
import { RenderProps } from "./components/Render/types";

const config: Config = {
  async save(data) {
    console.log(data);
  },
  headerLeft: <div>Back</div>,
  headerRight: <div>Publish</div>,
  additionalInputs: {
    css: CssEdit,
  },
  components: {
    HeadingBlock: {
      id: "HeadingBlock",
      name: "Heading Block",
      groupName: "Typography",

      properties: {
        children: {
          name: "children",
          type: "string",
          defaultData: "Heading",
        },
        prop2: {
          name: "prop2",
          type: "string",
          defaultData: "Heading",
        },
      },
      component: ({ children }: { children: string }) => <h1>{children}</h1>,
    },
    Stack: {
      id: "Stack",
      name: "Stack",
      groupName: "Layout",

      properties: {
        children: {
          name: "children",
          type: "children",
          defaultData: undefined,
        },
      },
      component: ({ children }: { children: string }) => (
        <div style={{ display: "flex", flexDirection: "row" }}>{children}</div>
      ),
    },
    TestInputs: {
      id: "TestInputs",
      name: "Test Inputs",
      groupName: "Test",
      properties: {
        checked: {
          name: "checked",
          description: "This is a test description",
          type: "boolean",
          defaultData: undefined,
        },
        num: {
          name: "num",
          label: "Some Enum",
          description:
            "This is a test description that is very very long. I mean very long. Very very long. So long that it has to be split up into multiple lines. Have you seen something so long yet?",
          type: "number",
          defaultData: undefined,
        },
        array: {
          name: "array",
          type: "array",
          items: {
            name: "item",
            type: "string",
            defaultData: undefined,
          },
          defaultItem: "hello",
          defaultData: undefined,
        },
        object: {
          name: "object",
          type: "object",
          fields: {
            name: {
              name: "name",
              type: "string",
              defaultData: undefined,
            },
            age: {
              name: "age",
              type: "number",
              defaultData: undefined,
            },
          },
        },
      },
      component: (props) => {
        return <pre>{JSON.stringify(props, null, 2)}</pre>;
      },
    },
    TestTemplate: {
      id: "TestTemplate",
      name: "Template",
      groupName: "Test",

      properties: {
        template: {
          name: "template",
          type: "template",
          label: "Test Template",
          defaultData: undefined,
          exampleTemplateData: {
            title: "Test Title",
            createdAt: new Date("2024-06-01T15:23:12"),
          },
        },
      },
      component: ({ template }: { template: RenderProps | undefined }) => {
        return (
          <div>
            Container
            <RenderTemplate
              template={template}
              props={{
                title: "Test Title 1",
                createdAt: new Date(),
                children: "Content1",
              }}
            />
            <RenderTemplate
              template={template}
              props={{
                title: "Test Title 2",
                createdAt: new Date(),
                children: "Content2",
              }}
            />
            <RenderTemplate
              {...template}
              template={template}
              props={{
                title: "Test Title 3",
                createdAt: new Date(),
                children: "Content3",
              }}
            />
          </div>
        );
      },
    },
    LeftRight: {
      id: "LeftRight",
      name: "Left Right",
      groupName: "Layout",
      properties: {
        left: {
          name: "left",
          type: "children",
          defaultData: undefined,
        },
        right: {
          name: "right",
          type: "children",
          defaultData: undefined,
        },
      },
      component: ({ left, right }: { left: string; right: string }) => (
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div>{left}</div>
          <div>{right}</div>
        </div>
      ),
    },
    Container: withCss({
      id: "Container",
      name: "Container",
      groupName: "Layout",

      properties: {
        children: {
          name: "children",
          type: "children",
          defaultData: undefined,
        },
        margin: {
          name: "margin",
          type: "string",
          enum: ["1em", "2em", "3em", "4em"],
          defaultData: undefined,
        },
      },
      component: ({
        children,
        margin,
      }: {
        children: string;
        margin: string;
      }) => <div style={{ margin }}>{children}</div>,
    }),
  },
  tepmlateFunction: templateString,
};

function App() {
  return <Editor config={config} />;
}

export default App;


// This is an unsafe template function using eval and therefore should not be used

function templateString(str: string, props: any) {
  void props;
  return str.replace(/\{([^}]+)\}/g, function (_m, n) {
    try {
      // return eval?.(`"use strict"; ${n}`);
      return eval(`"use strict"; ${n}`);
    } catch {
      return n;
    }
  //   const p = n.split("|")[0].split(".");
  //   let o = data;
  //   for (let i = 0; i < p.length; i++) {
  //     const x = o[p[i]];
  //     o = typeof x === "function" ? (x as () => string)() : o[p[i]];
  //     if (typeof o === "undefined" || o === null)
  //       return n.indexOf("|") !== -1 ? n.split("|")[1] : m;
  //   }
  //   return o;
  });
}
