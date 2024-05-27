import { Smartphone, Tablet, Monitor } from "lucide-react";
import { Config } from "./types";
import { EditorProvider, useEditor } from "./EditorContext";
import { ComponentsList } from "../ComponentsList";
import { ElementTree } from "../ElementTree";
import { ElementContainer, Page } from "../../types";
import { EditorBackendProvider } from "../EditorBackend";
import { Render } from "../EditorRender";
import { DropZone } from "../DropZone";
import s from "./Editor.module.css";
import { usePage } from "../../usePage";
import { ComponentProperties } from "../ComponentProperties";
import panzoom from "panzoom";
import {
  DefaultArrayInput,
  DefaultBooleanInput,
  DefaultChildrenInput,
  DefaultNumberInput,
  DefaultObjectInput,
  DefaultStringInput,
} from "../PropertyInput";
import { useState } from "react";
import {
  ElementHoverStyle,
  HoverControls,
  usePreviewElementOverHandler,
} from "./HoverControls";
import { classNames } from "../../util/classNames";
import { UndoControls } from "../UndoControls";
import { useComponents } from "../../useComponents";
import { SaveStatus } from "../SaveStatus";

function Center({ page }: { page: ElementContainer }) {
  const hoverState = useEditor();
  const overHandler = usePreviewElementOverHandler(page);
  const { componentsById } = useComponents();

  return (
    <div
      onMouseOver={(e) => overHandler(e.target)}
      className={classNames("tyzo-page-container", s.pageContainer)}
    >
      <ElementHoverStyle />
      {Object.keys(page.elements).length === 0 && !hoverState.isDragging ? (
        <div className={s.emptyPage}>
          Drag and drop elements from the left side here.
        </div>
      ) : null}
      <Render
        mode="edit"
        elementContainer={page}
        element={undefined}
        elements={page.children}
        componentsById={componentsById}
        isDragging={hoverState.isDragging}
      />
      <DropZone elementContainer={page} parentId={undefined} />
      <HoverControls />
    </div>
  );
}

function Props() {
  const { focusedItem } = useEditor();
  if (!focusedItem) {
    return null;
  }
  return <ComponentProperties id={focusedItem.id} />;
}

export function EditorContent({
  id,
  headerLeft,
  headerRight,
}: {
  id: string;
  headerLeft: React.ReactNode | undefined;
  headerRight: React.ReactNode | undefined;
}) {
  const [maxWidth, setMaxWidth] = useState<string>();
  const { page, undoManager, isSaving, hasChanges } = usePage({ id });
  const [didInitPanzoom, setDidInitPanzoom] = useState(false);
  if (!page) {
    return null;
  }
  return (
    <EditorProvider elementContainer={page}>
      <div className={s.editor}>
        <div className={s.header}>
          {headerLeft}
          <div className={s.headerCenter}>
            <div className={s.maxWidthSelector}>
              <button
                onClick={() => setMaxWidth("360px")}
                aria-label="Mobile screen size"
              >
                <Smartphone className={s.smallIcon} />
              </button>
              <button
                onClick={() => setMaxWidth("768px")}
                aria-label="Tablet screen size"
              >
                <Tablet className={s.icon} />
              </button>
              <button
                onClick={() => setMaxWidth(undefined)}
                aria-label="Desktop screen size"
              >
                <Monitor className={s.icon} />
              </button>
            </div>
            <UndoControls undoManager={undoManager} />
            <SaveStatus isSaving={isSaving} hasChanges={hasChanges} />
          </div>
          {headerRight}
        </div>

        <div className={s.belowHeader}>
          <div className={s.leftSide}>
            <ComponentsList elementContainer={page} />
            <ElementTree elementsContainer={page} />
          </div>
          <div className={s.center}>
            <div
              style={{
                maxWidth,
                margin: "0 auto",
                minHeight: "1000px",
                backgroundColor: "#fff",
              }}
              ref={(el) => {
                if (el) {
                  if (!didInitPanzoom) {
                    setDidInitPanzoom(true);
                    panzoom(el);
                  }
                }
              }}
            >
              <Center page={page} />
            </div>
          </div>
          <div className={s.rightSide}>
            <Props />
          </div>
        </div>
      </div>
    </EditorProvider>
  );
}

const blankPage: Page = {
  children: [],
  elements: {},
  id: "root",
  path: "/",
  title: "",
  name: "",
};

export function Editor({
  config,
  initialPage,
}: {
  config: Config;
  initialPage?: Page;
}) {
  return (
    <EditorBackendProvider
      basePath="/"
      backend={{
        async loadPage() {
          return initialPage ?? blankPage;
        },
        async loadPages() {
          return [];
        },
        async loadComponents() {
          return Object.values(config.components);
        },
        async savePage(page) {
          await config.save?.(JSON.parse(JSON.stringify(page)));
        },

        async loadComponentGroups() {
          const groups = Object.values(config.components).reduce(
            (all, comp) => Object.assign(all, { [comp.groupId]: true }),
            {} as Record<string, boolean>
          );
          return Object.keys(groups).map((id) => ({ id, name: id }));
        },
        async saveComponentInfo() {
          return;
        },
        supportsUpdatingComponents: false,
        inputs: {
          number: DefaultNumberInput,
          string: DefaultStringInput,
          boolean: DefaultBooleanInput,
          children: DefaultChildrenInput,
          object: DefaultObjectInput,
          array: DefaultArrayInput,
          ...config.additionalInputs,
        },
      }}
    >
      <EditorContent
        id="root"
        headerLeft={config.headerLeft}
        headerRight={config.headerRight}
      />
    </EditorBackendProvider>
  );
}
