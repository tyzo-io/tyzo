import { Puck, usePuck } from "@measured/puck";
import type { Config, Data } from "@measured/puck";
import "@measured/puck/puck.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useConfig } from "./Context";
import { useData } from "@/lib/useData";
import { MoveLeft, PanelLeft, PanelRight, Redo2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function CustomHeader({
  hasChanges,
  isSaving,
}: {
  hasChanges: boolean;
  isSaving: boolean;
}) {
  const puck = usePuck();
  return (
    <div
      className="border-b flex items-center flex-row gap-4 py-2 px-4"
      style={{ gridArea: "header" }}
    >
      <Button variant="link" asChild>
        <Link to="/">
          <MoveLeft className="h-4 w-4 mr-2" /> Back
        </Link>
      </Button>
      <div className="flex flex-row items-center">
        <Button
          variant="ghost"
          onClick={() => {
            puck.dispatch({
              type: "setUi",
              ui: {
                leftSideBarVisible: !puck.appState.ui.leftSideBarVisible,
              },
              recordHistory: false,
            });
          }}
        >
          <PanelLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            puck.dispatch({
              type: "setUi",
              ui: {
                rightSideBarVisible: !puck.appState.ui.rightSideBarVisible,
              },
              recordHistory: false,
            });
          }}
        >
          <PanelRight className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex-1"></div>
      <div className="flex flex-row items-center">
        <p className="text-sm text-muted-foreground mr-2">
          {isSaving ? "Saving..." : hasChanges ? "Unsaved" : "Saved"}
        </p>
        <Button
          variant="ghost"
          onClick={() => {
            puck.history.back?.();
          }}
        >
          <Undo2 className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            puck.history.forward?.();
          }}
        >
          <Redo2 className="h-5 w-5" />
        </Button>
      </div>
      {/* {props.children} */}
    </div>
  );
}

export const editorConfig: Config<
  Record<string, any>,
  { title?: string; path?: string }
> = {
  root: {
    fields: {
      title: { type: "text", label: "Title" },
      path: { type: "text", label: "Path" },
    },
  },
  components: {
    HeadingBlock: {
      fields: {
        children: {
          type: "text",
        },
      },
      render: ({ children }) => {
        return <h1>{children}</h1>;
      },
    },
  },
};

const initialData: Data = {
  content: [],
  root: {},
};

export function PageEditor() {
  const config = useConfig();
  const [state, setState] = useState(initialData);
  const { id } = useParams();
  const { data, isLoading } = useData(
    async () => (id ? await config.pages.get(id) : null),
    [id]
  );

  const [components, setComponents] = useState<
    Record<string, any> | undefined
  >();
  useEffect(() => {
    import(config.componentsImportPath).then(({ default: components }) =>
      setComponents(components)
    );
  }, [config.componentsImportPath]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const currentData = useRef(state);
  const timer = useRef<NodeJS.Timeout>();

  const save = useCallback(() => {
    setHasChanges(true);
    if (timer.current) {
      clearInterval(timer.current);
    }
    timer.current = setTimeout(async () => {
      if (id) {
        setIsSaving(true);
        await config.pages.update(id, {
          content: currentData.current,
          title: currentData.current.root.title,
          path: currentData.current.root.path,
        });
        setHasChanges(false);
        setIsSaving(false);
      }
    }, 2000);
  }, []);

  if (isLoading || !components) {
    return <div>Loading</div>;
  }
  if (!data) {
    return <div>Page not found</div>;
  }

  const editorData = (data.content as Data) ?? initialData;
  return (
    <Puck
      config={{
        ...editorConfig,
        components: {
          ...editorConfig.components,
          ...components,
        },
      }}
      data={{
        ...editorData,
        root: {
          ...editorData.root,
          props: {
            title: data.title,
            path: data.path,
          },
        },
      }}
      overrides={{
        header: () => (
          <CustomHeader hasChanges={hasChanges} isSaving={isSaving} />
        ),
      }}
      onChange={(data) => {
        setState(data);
        currentData.current = data;
        save();
      }}
      // onPublish={() => {
      //   if (id) {
      //     config.pages.update(id, {
      //       content: state,
      //       title: state.root.title,
      //       path: state.root.path,
      //     });
      //   }
      // }}
    />
  );
}
