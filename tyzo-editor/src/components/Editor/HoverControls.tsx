import { useCallback } from "react";
import { ElementContainer } from "../../types";
import { Rect, useEditor } from "./EditorContext";
import { getFocusedFrame } from "./getFocusedFrame";
import {
  ChevronDown,
  ChevronUp,
  ClipboardCopy,
  ClipboardPaste,
  Copy,
  Scissors,
  Trash,
} from "lucide-react";
import {
  copyElementToClipboard,
  duplicateElement,
  moveElementDown,
  moveElementUp,
  pasteElementFromClipboard,
  removeElement,
} from "../../operations";

// function getNextContainerElement(page: Page, id: string) {
//   let el: PageElement | null | undefined = page.elements?.[id];
//   while (el) {
//     el = el.parentId ? page.elements?.[el.parentId] : null;
//     if (el && "isContainerElement" in el) {
//       return el.id;
//     }
//   }
//   return null;
// }

export function HoverControls({
  hoverFrame,
  focusedItem,
  setFocusedItem,
  elementContainer,
}: {
  hoverFrame: Rect | null;
  focusedItem: { id: string; isFromTree: boolean; isClick: boolean } | null;
  setFocusedItem: (
    item: { id: string; isFromTree: boolean; isClick: boolean } | null
  ) => void;
  elementContainer: ElementContainer;
}) {
  //   props: {
  //   elementsContainer: ElementContainer;
  //   // standalone?: boolean;
  // }
  // const focusedElement = focusedItem?.id
  //   ? elementsContainer.elements?.[focusedItem?.id]
  //   : null;

  return (
    <>
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
      >
        {!focusedItem?.isFromTree ? (
          <>
            <div
              className={[
                "tyzo-element-hover-controls floating",
                // standalone ? null : "floating",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <button
                onClick={() => {
                  if (focusedItem) {
                    moveElementUp(elementContainer, focusedItem.id);
                    setTimeout(() => {
                      setFocusedItem(focusedItem);
                    }, 60);
                  }
                }}
              >
                <ChevronUp style={{ height: "20px", width: "20px" }} />
              </button>
              <button
                onClick={() => {
                  if (focusedItem) {
                    moveElementDown(elementContainer, focusedItem.id);
                    setTimeout(() => {
                      setFocusedItem(focusedItem);
                    }, 60);
                  }
                }}
              >
                <ChevronDown style={{ height: "20px", width: "20px" }} />
              </button>
              <button
                onClick={() => {
                  if (focusedItem) {
                    const dupe = duplicateElement(
                      elementContainer,
                      focusedItem.id
                    );
                    setTimeout(() => {
                      dupe &&
                        setFocusedItem({
                          id: dupe?.id,
                          isClick: false,
                          isFromTree: false,
                        });
                    }, 60);
                  }
                }}
              >
                <Copy
                  style={{ height: "16px", width: "16px", padding: "2px" }}
                />
              </button>
              {/* <button>
                <ClipboardCopy
                  style={{ height: "16px", width: "16px", padding: "2px" }}
                  onClick={() => {
                    if (focusedItem) {
                      copyElementToClipboard(elementContainer, focusedItem.id);
                    }
                  }}
                />
              </button>
              <button>
                <ClipboardPaste
                  style={{ height: "16px", width: "16px", padding: "2px" }}
                  onClick={() => {
                    if (focusedItem) {
                      pasteElementFromClipboard(
                        elementContainer,
                        focusedItem.id
                      );
                    }
                  }}
                />
              </button> */}
              {/* <button>
                <Scissors
                  style={{ height: "16px", width: "16px", padding: "2px" }}
                />
              </button> */}
              <button
                onClick={() => {
                  if (focusedItem) {
                    removeElement(elementContainer, focusedItem.id);
                    setFocusedItem(null);
                  }
                }}
              >
                <Trash
                  style={{ height: "16px", width: "16px", padding: "2px" }}
                />
              </button>
              {/* <AddElementInlineButton {...props} /> */}
              {/* <div
                // onClick={(e) => {
                //   if (editElementFrame) {
                //     setEditElementFrame(null);
                //     return;
                //   }
                //   const el = e.target as HTMLElement;
                //   const rect = el.getBoundingClientRect();
                //   setAddElementFrame(null);
                //   setEditElementFrame({
                //     top: rect.top,
                //     left: rect.left,
                //   });
                // }}
              > */}
              {/* MoreIcon */}
              {/* <Icon name="more" size="small" /> */}
              {/* </div> */}
              {/* FocusedElementLabel */}
              {/* {focusedElement && focusedElement.type
                ? focusedElement.properties?.userName
                  ? `${focusedElement.properties?.userName} (${t(
                      focusedElement.type
                    )})`
                  : t(focusedElement.type)
                : null} */}
            </div>

            {/* <div
                  style={{
                    position: "absolute",
                    bottom: "-24px",
                    left: 0,
                    right: 0,
                    height: "24px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    pointerEvents: "all",
                    cursor: "pointer",
                    margin: "0 auto",
                  }}
                  onClick={() => {
                    // setWasInElementSelector(false);
                    if (focusedItem?.id) {
                      const parentId =
                        getNextContainerElement(page, focusedItem.id) ?? null;
                      setAddElementParent(parentId);
                    } else {
                      setAddElementParent(null);
                    }
                    setOpenSection("blocks");
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "var(--element-select-border-color)",
                      color: "white",
                      borderRadius: "17px",
                      padding: "5px",
                    }}
                  >
                    <Icon name="math-plus" />
                  </div>
                </div> */}
          </>
        ) : null}
      </div>
      {/* {editElementFrame ? (
        <div
          className="tyzo-popup"
          style={{
            //   backgroundColor: "black",
            //   color: "white",
            //   position: "fixed",
            top: editElementFrame.top,
            bottom: editElementFrame.bottom,
            left:
              editElementFrame.left !== undefined
                ? 30 + editElementFrame.left
                : undefined,
            //   borderRadius: "5px",
          }}
        >
          {focusedElement?.type === "content" && (
            <Link
              to={`/app/files/${focusedElement.properties?.contentId}/edit`}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Icon name="pen" size="small" />
              {t("Edit content")}
            </Link>
          )}

          <div
            onClick={(e) => {
              e.stopPropagation();
              if (focusedItem) {
                // duplicatePageElement(elementsContainer, focusedItem.id);
              }
              setEditElementFrame(null);
            }}
          >
            <Icon name="duplicate" size="small" />
            Duplicate
          </div>
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (focusedItem) {
                // moveElementUp(elementsContainer, focusedItem.id);
              }
              setEditElementFrame(null);
            }}
          >
            <Icon name="chevron-up" size="small" />
            Move Up
          </div>
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (focusedItem) {
                // moveElementDown(elementsContainer, focusedItem.id);
              }
              setEditElementFrame(null);
            }}
          >
            <Icon name="chevron-down" size="small" />
            Move Down
          </div>
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (focusedItem) {
                // removePageElement(elementsContainer, focusedItem.id);
              }
              setEditElementFrame(null);
            }}
          >
            <Icon name="trash" size="small" />
            Delete
          </div>
        </div>
      ) : null} */}
    </>
  );
}

// export function usePreviewElementClickHandler(
//   state: HoverState,
//   elementsContainer: Partial<ElementContainer>
// ) {
//   return useCallback(
//     (target: EventTarget | null) => {
//       if (state.addElementFrame || state.editElementFrame) {
//         state.setAddElementFrame(null);
//         state.setEditElementFrame(null);
//       }
//       if (target && "getAttribute" in target) {
//         let el = target as HTMLElement | null;
//         const selectedIds: string[] = [];
//         while (el) {
//           const id = el.getAttribute("data-wzl-id");
//           const isInContainer = Boolean(id && elementsContainer.elements?.[id]);
//           if (id && isInContainer) {
//             selectedIds.push(id);
//           }
//           el = el.parentElement;
//         }
//         // state.setExpandedElementsFromSelect(selectedIds);
//         // if (selectedIds.length > 0) {
//         //   state.setSelectedElementId(selectedIds[0]);
//         //   state.setAddElementIsOpen(false);
//         //   state.setAddElementParent(null);
//         // }
//       } else if (!state.addElementFrame && !state.editElementFrame) {
//         // state.setExpandedElementsFromSelect([]);
//         // state.setFocusedItem(null);
//         // state.setAddElementIsOpen(false);
//         // state.setAddElementParent(null);
//       }
//     },
//     [
//       state.addElementFrame,
//       state.editElementFrame,
//       state.setAddElementFrame,
//       state.setEditElementFrame,
//       // state.setExpandedElementsFromSelect,
//       // state.setSelectedElementId,
//       // state.setAddElementIsOpen,
//       // state.setAddElementParent,
//       state.setFocusedItem,
//       elementsContainer.elements,
//     ]
//   );
// }

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

        .tyzo-element-hover-controls.floating {
          position: absolute;
          top: -36px;
          left: -1px;
          height: 36px;
          right: -1px;
          border-top-left-radius: 5px;
          border-top-right-radius: 5px;
          background-color: black;
          color: white;
        }

        .tyzo-element-hover-controls > * {
          border-radius: 5px;
          cursor: pointer;
          border: none;
          background-color: transparent;
          color: white;
        }

        .tyzo-element-hover-controls > button:hover,
        .tyzo-element-hover-controls > div:hover {
          background-color: rgba(255, 255, 255, 0.2);
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
