import { Smartphone, Tablet, Monitor, X } from "lucide-react";
import { Config } from "./types";
import { EditorProvider, useEditor } from "./EditorContext";
import { ComponentsList } from "../ComponentsList";
import { ElementTree } from "../ElementTree";
import { ElementContainer, Page } from "../../types";
import { EditorBackendProvider } from "../EditorBackend";
import { Render } from "../EditorRender";
import { DropZone, DropZoneStyle } from "../DropZone";
import s from "./Editor.module.css";
import { usePage } from "../../usePage";
import { ComponentProperties } from "../ComponentProperties";
import panzoom, { PanZoom } from "panzoom";
import {
  DefaultArrayInput,
  DefaultBooleanInput,
  DefaultChildrenInput,
  DefaultNumberInput,
  DefaultObjectInput,
  DefaultStringInput,
  DefaultTemplateInput,
} from "../PropertyInput";
import { Fragment, useState } from "react";
import {
  ElementHoverStyle,
  HoverControls,
  usePreviewElementOverHandler,
} from "./HoverControls";
import { classNames } from "../../util/classNames";
import { UndoControls } from "../UndoControls";
import { useComponents } from "../../useComponents";
import { SaveStatus } from "../SaveStatus";
import { I18nProvider, Translations, useTranslations } from "../../i18n";
import { EditorPreview } from "./Preview";
import { StackEdit, StackBreakpointsEdit } from "../../std/Stack/Edit";
import { CssEdit } from "../../CssProps/CssEdit";
import { Button } from "../Button";

function Center({
  page,
  contentWrapper,
  head,
  templateFunction,
  getScale,
  contextData
}: {
  page: ElementContainer;
  contentWrapper:
    | ((props: { children: React.ReactNode }) => JSX.Element)
    | undefined;
  head: React.ReactNode | undefined;
  templateFunction:
    | ((template: string, props: Record<string, any>) => string)
    | undefined;
  getScale: () => number;
  contextData?: Record<string, any>;
}) {
  const { elementContainer, editTemplate, ...hoverState } = useEditor();
  const overHandler = usePreviewElementOverHandler(page);
  const { componentsById } = useComponents();
  const { translations } = useTranslations();
  const { hoverFrame, focusedItem } = useEditor();

  const Wrapper = contentWrapper ?? Fragment;
  const TemplateWrapper =
    editTemplate?.property.templateEditContainer ?? Fragment;

  return (
    <EditorPreview
      head={
        <>
          <ElementHoverStyle />
          <DropZoneStyle />
          {head}
        </>
      }
      getScale={getScale}
    >
      <div
        onMouseOver={(e) => overHandler(e, { isClick: false })}
        onClick={(e) => overHandler(e, { isClick: true })}
        className="tyzo-page-container"
      >
        <Wrapper>
          <TemplateWrapper>
            {Object.keys(elementContainer.elements).length === 0 &&
            !hoverState.isDragging ? (
              <div
                style={{
                  padding: "2em",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  opacity: 0.7,
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              >
                {translations.emptyPageInfo}
              </div>
            ) : null}
            <Render
              elementContainer={elementContainer}
              elements={elementContainer.children}
              componentsById={componentsById}
              isDragging={hoverState.isDragging}
              templateFunction={templateFunction}
              props={
                (editTemplate
                  ? editTemplate?.property.exampleTemplateData
                  : contextData) ?? {}
              }
            />
            <DropZone
              elementContainer={elementContainer}
              parentId={undefined}
            />
            <HoverControls hoverFrame={hoverFrame} focusedItem={focusedItem} />
          </TemplateWrapper>
        </Wrapper>
      </div>
    </EditorPreview>
  );
}

function Props() {
  const { focusedItem } = useEditor();
  if (!focusedItem) {
    return null;
  }
  return <ComponentProperties id={focusedItem.id} />;
}

export function EditorContentInner({
  id,
  headerLeft,
  headerRight,
  contentWrapper,
  head,
  templateFunction,
  contextData,
}: {
  id: string;
  headerLeft: React.ReactNode | undefined;
  headerRight: React.ReactNode | undefined;
  contentWrapper:
    | ((props: { children: React.ReactNode }) => JSX.Element)
    | undefined;
  head: React.ReactNode | undefined;
  templateFunction:
    | ((template: string, props: Record<string, any>) => string)
    | undefined;
  contextData?: Record<string, any>;
}) {
  const [maxWidth, setMaxWidth] = useState<string>();
  const { undoManager, isSaving, hasChanges } = usePage({ id });
  const [didInitPanzoom, setDidInitPanzoom] = useState(false);
  const { translations } = useTranslations();
  const { elementContainer, setEditTemplate, editTemplate } = useEditor();
  const [panzoomInstance, setPanzoomInstance] = useState<PanZoom>();

  return (
    <div className={s.editor}>
      <div className={classNames("tyzo", s.header)}>
        {headerLeft ?? <div></div>}
        <div className={s.headerCenter}>
          <div className={s.maxWidthSelector}>
            <button
              onClick={() => setMaxWidth("360px")}
              aria-label={translations.mobileScreenSize}
            >
              <Smartphone className={s.smallIcon} />
            </button>
            <button
              onClick={() => setMaxWidth("768px")}
              aria-label={translations.tabletScreenSize}
            >
              <Tablet className={s.icon} />
            </button>
            <button
              onClick={() => setMaxWidth(undefined)}
              aria-label={translations.desktopScreenSize}
            >
              <Monitor className={s.icon} />
            </button>
          </div>
          <UndoControls undoManager={undoManager} />
          <SaveStatus isSaving={isSaving} hasChanges={hasChanges} />
        </div>
        {headerRight ?? <div></div>}
      </div>

      <div className={s.belowHeader}>
        <div className={classNames("tyzo", s.leftSide)}>
          <ComponentsList elementContainer={elementContainer} />
          <ElementTree elementsContainer={elementContainer} />
        </div>
        <div className={s.center}>
          {editTemplate && (
            <div className={s.templateEditorControls}>
              {translations.editing}{" "}
              {editTemplate.property.templateTitle ?? translations.template}
              <Button
                variant="ghost"
                onClick={() => {
                  setEditTemplate(undefined);
                }}
              >
                <X />
              </Button>
            </div>
          )}
          <div
            style={{
              maxWidth,
              margin: "0 auto",
              // minHeight: "1000px",
              backgroundColor: "#fff",
            }}
            ref={(el) => {
              // zoomRef.current = el;
              if (el) {
                if (!didInitPanzoom) {
                  setDidInitPanzoom(true);
                  const instance = panzoom(el);
                  setPanzoomInstance(instance);
                }
              }
            }}
          >
            <Center
              page={elementContainer}
              contentWrapper={contentWrapper}
              head={head}
              templateFunction={templateFunction}
              getScale={() => panzoomInstance?.getTransform().scale ?? 1}
              contextData={contextData}
            />
          </div>
        </div>
        <div className={classNames("tyzo", s.rightSide)}>
          <Props />
        </div>
      </div>
    </div>
  );
}

export function EditorContent({
  id,
  headerLeft,
  headerRight,
  contentWrapper,
  head,
  templateFunction,
  contextData,
}: {
  id: string;
  headerLeft: React.ReactNode | undefined;
  headerRight: React.ReactNode | undefined;
  contentWrapper:
    | ((props: { children: React.ReactNode }) => JSX.Element)
    | undefined;
  head: React.ReactNode | undefined;
  templateFunction:
    | ((template: string, props: Record<string, any>) => string)
    | undefined;
  contextData?: Record<string, any>;
}) {
  const { page } = usePage({ id });

  if (!page) {
    return null;
  }
  return (
    <EditorProvider elementContainer={page}>
      <EditorContentInner
        id={id}
        headerLeft={headerLeft}
        headerRight={headerRight}
        contentWrapper={contentWrapper}
        head={head}
        templateFunction={templateFunction}
        contextData={contextData}
      />
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
  contextData,
  translations,
}: {
  config: Config;
  initialPage?: Page;
  contextData?: Record<string, any>;
  translations?: Translations;
}) {
  return (
    <I18nProvider translations={translations}>
      <EditorBackendProvider
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
              (all, comp) => Object.assign(all, { [comp.groupName]: true }),
              {} as Record<string, boolean>
            );
            return Object.keys(groups).map((id) => ({ id, name: id }));
          },
          async saveComponentInfo() {
            return;
          },
          shouldAutoSave: config.shouldAutoSave,
          onChange: config.onChange,
          supportsUpdatingComponents: false,
          inputs: {
            number: DefaultNumberInput,
            string: DefaultStringInput,
            boolean: DefaultBooleanInput,
            children: DefaultChildrenInput,
            object: DefaultObjectInput,
            array: DefaultArrayInput,
            css: CssEdit,
            stackBaseRule: StackEdit,
            stackAdditionalRules: StackBreakpointsEdit,
            template: DefaultTemplateInput,
            ...config.additionalInputs,
          },
        }}
      >
        <EditorContent
          id="root"
          headerLeft={config.headerLeft}
          headerRight={config.headerRight}
          contentWrapper={config.contentWrapper}
          head={config.head}
          templateFunction={config.tepmlateFunction}
          contextData={contextData}
        />
      </EditorBackendProvider>
    </I18nProvider>
  );
}
