import React, { createContext, useContext, useState } from "react";
import { PageElement, ElementContainer, TemplateProperty } from "../../types";
import { getFocusedFrame } from "./getFocusedFrame";

export type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const EditorContext = createContext({
  elementContainer: {} as ElementContainer,

  editTemplate: undefined as
    | {
        element: PageElement;
        property: TemplateProperty;
      }
    | undefined,
  setEditTemplate: (() => {}) as (
    template:
      | {
          element: PageElement;
          property: TemplateProperty;
        }
      | undefined
  ) => void,
  isDragging: false,
  setIsDragging: (() => {}) as (value: boolean) => void,

  hoverFrame: null as Rect | null,
  setHoverFrame: (() => {}) as (value: Rect | null) => void,

  // addElementFrame: null as Rect | null,
  // setAddElementFrame: (() => {}) as (value: Rect | null) => void,
  // editElementFrame: null as Rect | null,
  // setEditElementFrame: (() => {}) as (value: Rect | null) => void,

  focusedItem: null as {
    id: string;
    isFromTree: boolean;
    isClick: boolean;
  } | null,
  setFocusedItem: (() => {}) as (
    value: { id: string; isFromTree: boolean; isClick: boolean } | null
  ) => void,
});

export function EditorProvider({
  elementContainer,
  children,
}: {
  elementContainer: ElementContainer;
  children: React.ReactNode;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [hoverFrame, setHoverFrame] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const [templateToEdit, setTemplateToEdit] = useState<{
    element: PageElement;
    property: TemplateProperty;
  }>();
  // const [addElementFrame, setAddElementFrame] = useState<{
  //   top: number;
  //   bottom: number;
  //   left: number;
  //   right: number;
  // } | null>(null);
  // const [editElementFrame, setEditElementFrame] = useState<{
  //   top: number;
  //   bottom: number;
  //   left: number;
  //   right: number;
  // } | null>(null);

  // const [expandedElementsFromOver, setExpandedElementsFromOver] = useState<
  //   string[]
  // >([]);
  // const [expandedElementsFromSelect, setExpandedElementsFromSelect] = useState<
  //   string[]
  // >([]);
  const [focusedItem, setFocusedItem] = useState<{
    id: string;
    isFromTree: boolean;
    isClick: boolean;
  } | null>(null);

  return (
    <EditorContext.Provider
      value={{
        elementContainer:
          templateToEdit?.element.data?.[templateToEdit.property.name] ??
          elementContainer,
        editTemplate: templateToEdit,
        setEditTemplate: setTemplateToEdit,
        isDragging,
        setIsDragging,
        hoverFrame,
        setHoverFrame,
        // addElementFrame,
        // setAddElementFrame,
        // editElementFrame,
        // setEditElementFrame,
        focusedItem,
        setFocusedItem: (
          value: { id: string; isFromTree: boolean; isClick: boolean } | null
        ) => {
          if (value) {
            const iframe = document.querySelector(".tyzo-preview-iframe") as
              | HTMLIFrameElement
              | undefined;
            const el = iframe?.contentDocument?.querySelector(
              `[data-tyzo-id="${value.id}"]`
            );
            if (el) {
              const frame = getFocusedFrame(el as HTMLElement);
              setHoverFrame(frame ?? null);
            }
          } else {
            setHoverFrame(null);
          }
          setFocusedItem(value);
        },
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const {
    elementContainer,
    setEditTemplate,
    editTemplate,
    isDragging,
    setIsDragging,
    hoverFrame,
    setHoverFrame,
    focusedItem,
    setFocusedItem,
  } = useContext(EditorContext);
  return {
    elementContainer,
    setEditTemplate,
    editTemplate,
    isDragging,
    setIsDragging,
    hoverFrame,
    setHoverFrame,
    focusedItem,
    setFocusedItem,
  };
}
