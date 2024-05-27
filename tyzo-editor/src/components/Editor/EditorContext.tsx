import React, { createContext, useContext, useState } from "react";
import { ElementContainer } from "../../types";
import { getFocusedFrame } from "./getFocusedFrame";

export type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const EditorContext = createContext({
  elementContainer: {} as ElementContainer,
  isDragging: false,
  setIsDragging: (() => {}) as (value: boolean) => void,

  hoverFrame: null as Rect | null,
  setHoverFrame: (() => {}) as (value: Rect | null) => void,

  // addElementFrame: null as Rect | null,
  // setAddElementFrame: (() => {}) as (value: Rect | null) => void,
  // editElementFrame: null as Rect | null,
  // setEditElementFrame: (() => {}) as (value: Rect | null) => void,

  focusedItem: null as { id: string; isFromTree: boolean } | null,
  setFocusedItem: (() => {}) as (
    value: { id: string; isFromTree: boolean } | null
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
  } | null>(null);


  return (
    <EditorContext.Provider
      value={{
        elementContainer,
        isDragging,
        setIsDragging,
        hoverFrame,
        setHoverFrame,
        // addElementFrame,
        // setAddElementFrame,
        // editElementFrame,
        // setEditElementFrame,
        focusedItem,
        setFocusedItem: (value: { id: string; isFromTree: boolean } | null) => {
          if (value) {
            const el = document.querySelector(`[data-tyzo-id="${value.id}"]`);
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
    isDragging,
    setIsDragging,
    hoverFrame,
    setHoverFrame,
    focusedItem,
    setFocusedItem,
  } = useContext(EditorContext);
  return {
    elementContainer,
    isDragging,
    setIsDragging,
    hoverFrame,
    setHoverFrame,
    focusedItem,
    setFocusedItem,
  };
}
