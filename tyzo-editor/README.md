# Tyzo Page Editor

Tyzo page editor is an open source visual editor for react. You can use it to build custom drag-and-drop experiences with your own React components.

More documentation and a live demo is coming soon.

## Getting Started

### Install the package

```
npm i @measured/puck --save
```

### Render the editor

```
import { Editor, Config } from "@tyzo/page-editor";

const config: Config = {
  async save(data) {
    console.log(data);
  },
  headerLeft: <div>Back</div>,
  headerRight: <div>Publish</div>,
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
  }
}

export function App() {
  return <Editor config={config} />;
}
```

### Render the page

```
import { Render, Config } from "@tyzo/page-editor";

const config: Config = {
  headerLeft: <div>Back</div>,
  headerRight: <div>Publish</div>,
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
  }
}

export function App() {
  return (
    <Render
      config={config}
      data={{
        children: ["1"],
        elements: {
          "1": {
            id: "1",
            componentId: "HeadingBlock",
            data: { children: "Hello!" },
          },
        },
      }}
    />
  );
}
```