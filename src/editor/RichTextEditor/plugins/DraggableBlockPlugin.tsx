import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { eventFiles } from "@lexical/rich-text";
import { calculateZoomLevel, mergeRegister } from "@lexical/utils";
import {
  $getNearestNodeFromDOMNode,
  $getNodeByKey,
  $createParagraphNode,
  $getRoot,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  DRAGOVER_COMMAND,
  DROP_COMMAND,
  LexicalEditor,
} from "lexical";
import * as React from "react";
import {
  DragEvent as ReactDragEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { GripVerticalIcon, PlusIcon } from "lucide-react";
import { getBlockElement, getCollapsedMargins, isHTMLElement } from "./shared";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Button } from "../../ui/button";
import { $createImageNode } from "../nodes/ImageNode";

const SPACE = 0;
const TARGET_LINE_HALF_HEIGHT = 2;
const DRAGGABLE_BLOCK_MENU_CLASSNAME = "draggable-block-menu";
const DRAG_DATA_FORMAT = "application/x-lexical-drag-block";
const TEXT_BOX_HORIZONTAL_PADDING = 28;

function isOnMenu(element: HTMLElement): boolean {
  return !!element.closest(`.${DRAGGABLE_BLOCK_MENU_CLASSNAME}`);
}

function setMenuPosition(
  targetElem: HTMLElement | null,
  menuOpen: boolean,
  floatingElem: HTMLElement,
  anchorElem: HTMLElement
) {
  if (!targetElem  && !menuOpen) {
    floatingElem.style.opacity = "0";
    floatingElem.style.transform = "translate(-10000px, -10000px)";
    return;
  }

  if (!targetElem) {
    return;
  }

  const targetRect = targetElem.getBoundingClientRect();
  const targetStyle = window.getComputedStyle(targetElem);
  const floatingElemRect = floatingElem.getBoundingClientRect();
  const anchorElementRect = anchorElem.getBoundingClientRect();

  const top =
    targetRect.top +
    (parseInt(targetStyle.lineHeight, 10) - floatingElemRect.height) / 2 -
    anchorElementRect.top;

  const left = SPACE;

  floatingElem.style.opacity = "1";
  floatingElem.style.transform = `translate(${left}px, ${top}px)`;
}

function setDragImage(
  dataTransfer: DataTransfer,
  draggableBlockElem: HTMLElement
) {
  const { transform } = draggableBlockElem.style;

  // Remove dragImage borders
  draggableBlockElem.style.transform = "translateZ(0)";
  dataTransfer.setDragImage(draggableBlockElem, 0, 0);

  setTimeout(() => {
    draggableBlockElem.style.transform = transform;
  });
}

function setTargetLine(
  targetLineElem: HTMLElement,
  targetBlockElem: HTMLElement,
  mouseY: number,
  anchorElem: HTMLElement
) {
  const { top: targetBlockElemTop, height: targetBlockElemHeight } =
    targetBlockElem.getBoundingClientRect();
  const { top: anchorTop, width: anchorWidth } =
    anchorElem.getBoundingClientRect();
  const { marginTop, marginBottom } = getCollapsedMargins(targetBlockElem);
  let lineTop = targetBlockElemTop;
  if (mouseY >= targetBlockElemTop) {
    lineTop += targetBlockElemHeight + marginBottom / 2;
  } else {
    lineTop -= marginTop / 2;
  }

  const top = lineTop - anchorTop - TARGET_LINE_HALF_HEIGHT;
  const left = TEXT_BOX_HORIZONTAL_PADDING - SPACE;

  targetLineElem.style.transform = `translate(${left}px, ${top}px)`;
  targetLineElem.style.width = `${
    anchorWidth - (TEXT_BOX_HORIZONTAL_PADDING - SPACE) * 2
  }px`;
  targetLineElem.style.opacity = ".4";
}

function hideTargetLine(targetLineElem: HTMLElement | null) {
  if (targetLineElem) {
    targetLineElem.style.opacity = "0";
    targetLineElem.style.transform = "translate(-10000px, -10000px)";
  }
}

function useDraggableBlockMenu(
  editor: LexicalEditor,
  anchorElem: HTMLElement,
  isEditable: boolean
): JSX.Element {
  const scrollerElem = anchorElem.parentElement;

  const menuRef = useRef<HTMLDivElement>(null);
  const targetLineRef = useRef<HTMLDivElement>(null);
  const isDraggingBlockRef = useRef<boolean>(false);
  const [draggableBlockElem, setDraggableBlockElem] = useState<HTMLElement | null>(null);
  const [lastActiveElement, setLastActiveElement] =
    useState<HTMLElement | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    function onMouseMove(event: MouseEvent) {
      const target = event.target;
      if (!isHTMLElement(target)) {
        setDraggableBlockElem(null);
        return;
      }

      if (isOnMenu(target)) {
        return;
      }

      const _draggableBlockElem = getBlockElement(anchorElem, editor, event);

      setDraggableBlockElem(_draggableBlockElem);
      setLastActiveElement(_draggableBlockElem);
    }

    function onMouseLeave() {
      setDraggableBlockElem(null);
    }

    scrollerElem?.addEventListener("mousemove", onMouseMove);
    scrollerElem?.addEventListener("mouseleave", onMouseLeave);

    return () => {
      scrollerElem?.removeEventListener("mousemove", onMouseMove);
      scrollerElem?.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [scrollerElem, anchorElem, editor]);

  useEffect(() => {
    if (menuRef.current) {
      setMenuPosition(
        draggableBlockElem,
        isMenuOpen,
        menuRef.current,
        anchorElem
      );
    }
  }, [anchorElem, draggableBlockElem, isMenuOpen]);

  useEffect(() => {
    function onDragover(event: DragEvent): boolean {
      if (!isDraggingBlockRef.current) {
        return false;
      }
      const [isFileTransfer] = eventFiles(event);
      if (isFileTransfer) {
        return false;
      }
      const { pageY, target } = event;
      if (!isHTMLElement(target)) {
        return false;
      }
      const targetBlockElem = getBlockElement(anchorElem, editor, event, true);
      const targetLineElem = targetLineRef.current;
      if (targetBlockElem === null || targetLineElem === null) {
        return false;
      }
      setTargetLine(
        targetLineElem,
        targetBlockElem,
        pageY / calculateZoomLevel(target),
        anchorElem
      );
      // Prevent default event to be able to trigger onDrop events
      event.preventDefault();
      return true;
    }

    function $onDrop(event: DragEvent): boolean {
      if (!isDraggingBlockRef.current) {
        return false;
      }
      const [isFileTransfer] = eventFiles(event);
      if (isFileTransfer) {
        return false;
      }
      const { target, dataTransfer, pageY } = event;
      const dragData = dataTransfer?.getData(DRAG_DATA_FORMAT) || "";
      const draggedNode = $getNodeByKey(dragData);
      if (!draggedNode) {
        return false;
      }
      if (!isHTMLElement(target)) {
        return false;
      }
      const targetBlockElem = getBlockElement(anchorElem, editor, event, true);
      if (!targetBlockElem) {
        return false;
      }
      const targetNode = $getNearestNodeFromDOMNode(targetBlockElem);
      if (!targetNode) {
        return false;
      }
      if (targetNode === draggedNode) {
        return true;
      }
      const targetBlockElemTop = targetBlockElem.getBoundingClientRect().top;
      if (pageY / calculateZoomLevel(target) >= targetBlockElemTop) {
        targetNode.insertAfter(draggedNode);
      } else {
        targetNode.insertBefore(draggedNode);
      }
      setDraggableBlockElem(null);

      return true;
    }

    return mergeRegister(
      editor.registerCommand(
        DRAGOVER_COMMAND,
        (event) => {
          return onDragover(event);
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        DROP_COMMAND,
        (event) => {
          return $onDrop(event);
        },
        COMMAND_PRIORITY_HIGH
      )
    );
  }, [anchorElem, editor]);

  function onDragStart(event: ReactDragEvent<HTMLDivElement>): void {
    const dataTransfer = event.dataTransfer;
    if (!dataTransfer || !draggableBlockElem) {
      return;
    }
    setDragImage(dataTransfer, draggableBlockElem);
    let nodeKey = "";
    editor.update(() => {
      const node = $getNearestNodeFromDOMNode(draggableBlockElem);
      if (node) {
        nodeKey = node.getKey();
      }
    });
    isDraggingBlockRef.current = true;
    dataTransfer.setData(DRAG_DATA_FORMAT, nodeKey);
  }

  function onDragEnd(): void {
    isDraggingBlockRef.current = false;
    if (!isMenuOpen) {
      hideTargetLine(targetLineRef.current);
    }
  }

  const handleAddNode = (type: string) => {
    editor.update(() => {
      if (lastActiveElement) {
        const node = $getNearestNodeFromDOMNode(lastActiveElement);
        if (node) {
          let newNode;
          switch (type) {
            case "paragraph":
              newNode = $createParagraphNode();
              break;
            case "image":
              newNode = $createImageNode({ url: "", alt: "" }); // Placeholder for image node
              break;
            // case "list":
            //   newNode = $createListNode("bullet").append($createListItemNode());
            //   break;
            default:
              return;
          }
          node.insertAfter(newNode);
        }
      }
    });
  };

  return createPortal(
    <>
      <div
        className={`${DRAGGABLE_BLOCK_MENU_CLASSNAME} opacity-0 rounded absolute will-change-transform left-2 top-0 hover:bg-gray-200 cursor-grab active:cursor-grabbing`}
        ref={menuRef}
        draggable={true}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onClick={(e) => e.preventDefault()}
      >
        {isEditable && (
          <div className="w-5 flex flex-col justify-center items-center opacity-30">
            <GripVerticalIcon className="pointer-events-none h-5" />{" "}
            {/* <Button className="w-5 h-5" variant="ghost">
              <PlusIcon className="pointer-events-none h-5" />
            </Button> */}
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
              >
                <PlusIcon className="pointer-events-none h-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {/* <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator /> */}
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuItem>Remove</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleAddNode("paragraph")}>
                  Paragraph
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddNode("heading")}>
                  Heading
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddNode("quote")}>
                  Quote
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddNode("image")}>
                  Image
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddNode("list")}>
                  List
                </DropdownMenuItem>

                {/* <DropdownMenuItem>Team</DropdownMenuItem>
                <DropdownMenuItem>Subscription</DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
      <div
        className="draggable-block-target-line flex justify-between items-center pointer-events-none bg-indigo-500 h-0.5 absolute -left-2 -right-2 top-0.5 opacity-0 will-change-transform"
        ref={targetLineRef}
      >
        <div className="rounded-full bg-indigo-500 h-2 w-2" />
        <div className="rounded-full bg-indigo-500 h-2 w-2" />
      </div>
    </>,
    anchorElem
  );
}

export default function DraggableBlockPlugin({
  anchorElem = document.body,
}: {
  anchorElem?: HTMLElement;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  return useDraggableBlockMenu(editor, anchorElem, editor._editable);
}
