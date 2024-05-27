import { CssEdit, withCss } from "./CssProps";
import { Editor } from "./components/Editor";
import { Config } from "./components/Editor/types";
// import { Render } from "./components/Render";

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
      groupId: "Typography",
      source: {
        type: "builtin",
      },

      properties: {
        children: {
          name: "children",
          type: "string",
          defaultData: "Heading",
        },
      },
      component: ({ children }: { children: string }) => <h1>{children}</h1>,
    },
    Stack: {
      id: "Stack",
      name: "Stack",
      groupId: "Layout",
      source: {
        type: "builtin",
      },

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
      groupId: "Test",
      source: {
        type: "builtin",
      },
      properties: {
        checked: {
          name: "checked",
          type: "boolean",
          defaultData: undefined,
        },
        num: {
          name: "num",
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
    Container: withCss({
      id: "Container",
      name: "Container",
      groupId: "Layout",
      source: {
        type: "builtin",
      },

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
};

function App() {
  return <Editor config={config} />;
  // return (
  //   <Render
  //     config={config}
  //     data={{
  //       children: ["1"],
  //       elements: {
  //         "1": {
  //           id: "1",
  //           componentId: "HeadingBlock",
  //           data: { children: "Hello!" },
  //         },
  //       },
  //     }}
  //   />
  // );
}

export default App;
