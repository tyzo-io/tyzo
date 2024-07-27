import { useCallback } from "react";
import { ElementContainer } from "../../types";
import { Rect, useEditor } from "./EditorContext";
import { getFocusedFrame } from "./getFocusedFrame";

export function HoverFrame({ hoverFrame }: { hoverFrame: Rect | null }) {
  return (
    <div
      id="tyzo-highlight-frame"
      style={{
        visibility: hoverFrame ? "visible" : "hidden",
        position: "absolute",
        border: "var(--element-select-border)",
        userSelect: "none",
        pointerEvents: "none",
        ...(hoverFrame ?? {}),
      }}
    ></div>
  );
}

export function usePreviewElementOverHandler(
  // state: HoverState,
  elementsContainer: Partial<ElementContainer>
) {
  const state = useEditor();

  return useCallback(
    (event: React.MouseEvent, opts: { isClick: boolean }) => {
      if (event.ctrlKey) {
        return;
      }
      if (!opts.isClick && state.focusedItem?.isClick) {
        return;
      }
      if (opts.isClick && state.focusedItem?.isClick) {
        state.setFocusedItem(null);
        state.setHoverFrame(null);
        return;
      }
      const target = event.target;
      if (target === null) {
        state.setFocusedItem(null);
        state.setHoverFrame(null);
        return;
      }
      // if (state.addElementFrame || state.editElementFrame) {
      //   return;
      // }
      if (target && "getAttribute" in target) {
        let el = target as HTMLElement | null;
        const selectedIds: string[] = [];
        let selectedElement: HTMLElement | null = null;
        while (el) {
          if (el.classList.contains("tyzo-page-container")) {
            break;
          }
          if (
            el.id === "tyzo-highlight-frame" ||
            el.getAttribute("class")?.includes("tyzo-popup")
          ) {
            return;
          }
          // const id = el.previousSibling?.firstChild?.textContent?.match(
          //   /data-tyzo-id="([^"]+)"/
          // )?.[1];
          const id = el.getAttribute("data-tyzo-id");
          const isInContainer = Boolean(id && elementsContainer.elements?.[id]);
          if (selectedIds.length === 0) {
            selectedElement = el;
          }
          if (id && isInContainer) {
            selectedIds.push(id);
          }
          el = el.parentElement;
        }
        // state.setExpandedElementsFromOver(selectedIds);
        if (selectedIds.length > 0) {
          const newId = selectedIds[0];
          if (
            newId === state.focusedItem?.id &&
            opts.isClick === state.focusedItem.isClick
          ) {
            return;
          }
          state.setFocusedItem({
            id: selectedIds[0],
            isFromTree: false,
            isClick: opts.isClick,
          });
          const frame = selectedElement && getFocusedFrame(selectedElement);
          state.setHoverFrame(frame ?? null);
          // } else {
          //   state.setFocusedItem(null);
        }
      }
    },
    [
      // state.addElementFrame,
      // state.editElementFrame,
      // state.setExpandedElementsFromOver,
      // state.setFocusedItem,
      elementsContainer.elements,
      state,
    ]
  );
}

export function ElementHoverStyle() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
        :root {
          --element-select-border-color: rgba(50, 150, 255, 0.6);
          --element-select-bg-color: rgba(50, 150, 255, 0.2);
          --element-select-border: 1px solid var(--element-select-border-color);
        }

        .tyzo-element-hover-controls {
          pointer-events: all;
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 2px;
          justify-content: flex-end;
          padding-right: 5px;
          padding-left: 5px;
        }

        .tyzo-popup {
          background-color: black;
          color: white;
          position: fixed;
          border-radius: 7px;
        }

        .tyzo-popup > * {
          margin: 5px;
          padding: 5px;
          border-radius: 5px;
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 5px;
        }

        .tyzo-popup > *:hover,
        .tyzo-popup > div:hover {
          background-color: rgba(255, 255, 255, 0.2);
          cursor: pointer;
        }
        `,
      }}
    ></style>
  );
}
