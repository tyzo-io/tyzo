import { DragIcon } from "../Icons/DragIcon";
import { duplicateElement, moveElement, removeElement } from "../../operations";
import { useState } from "react";
import { TrashIcon } from "../Icons/TrashIcon";
import s from "./ElementTreeItem.module.css";
import {
  ComponentInfo,
  ElementContainer,
  PageElement,
} from "../../types";
import { useEditor } from "../Editor/EditorContext";
import { classNames } from "../../util/classNames";
import { Button } from "../Button";
import { Copy } from "lucide-react";

function getComponentName({
  componentId,
  component,
  elementId,
}: {
  componentId: string;
  component: ComponentInfo | undefined;
  elementId: string;
}) {
  if (componentId.startsWith("global:")) {
    return componentId.substring("global:".length);
  }
  return component?.name ?? elementId;
}

export function ElementTreeItem({
  element,
  elementContainer,
  components,
}: {
  element: PageElement;
  elementContainer: ElementContainer;
  components: ComponentInfo[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const component = components.find(
    (component) => component.id === element.componentId
  );
  const { setIsDragging, isDragging, focusedItem, setFocusedItem } =
    useEditor();
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  return (
    <div
      className={classNames(
        s.elementItem,
        focusedItem?.id === element.id && s.focused
      )}
      onClick={(e) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
        if (focusedItem?.id === element.id) {
          setFocusedItem(null);
        } else {
          setFocusedItem({ id: element.id, isFromTree: true });
        }
      }}
      onDragOver={(e) => {
        setIsDraggingOver(true);
        e.preventDefault();
      }}
      onDragLeave={() => {
        setIsDraggingOver(false);
      }}
      onDrop={(e) => {
        const elementIdToMove = e.dataTransfer.getData("tyzo/element-id");
        if (elementIdToMove) {
          moveElement(
            elementContainer,
            elementIdToMove,
            element.parent,
            element.id
          );
        }
      }}
    >
      <div
        className={s.title}
        // onClick={() => {
        //   setIsExpanded(!isExpanded);
        // }}
        draggable
        onDragStart={(e) => {
          e.stopPropagation();
          setIsDragging(true);
          e.dataTransfer.setData("tyzo/element-id", element.id);
        }}
        onDragEnd={() => {
          setIsDragging(false);
        }}
      >
        <div className={s.dragIcon}>
          <DragIcon />
        </div>
        {/* <div className={s.label}>{Comp?.Editor?.label} </div> */}
        <div className={s.label}>
          {getComponentName({
            component,
            elementId: element.id,
            componentId: element.componentId,
          })}
        </div>
        <Button
          className={s.trashIcon}
          variant="ghost"
          size="icon"
          onClick={() => {
            duplicateElement(elementContainer, element.id);
          }}
        >
          <Copy />
        </Button>
        <Button
          className={s.trashIcon}
          variant="ghost"
          size="icon"
          onClick={() => {
            removeElement(elementContainer, element.id);
          }}
        >
          <TrashIcon />
        </Button>
        <div>
          {element.children?.length ? (
            isExpanded ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 12C4 11.4477 4.44772 11 5 11H19C19.5523 11 20 11.4477 20 12C20 12.5523 19.5523 13 19 13H5C4.44772 13 4 12.5523 4 12Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 4C11.4477 4 11 4.44772 11 5V11H5C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11H13V5C13 4.44772 12.5523 4 12 4Z"
                  fill="currentColor"
                />
              </svg>
            )
          ) : null}
        </div>
      </div>
      {isExpanded && (
        <div style={{ marginLeft: "10px" }}>
          {element.children?.map(
            (childId) =>
              elementContainer.elements[childId] && (
                <ElementTreeItem
                  key={childId}
                  elementContainer={elementContainer}
                  element={elementContainer.elements[childId]!}
                  components={components}
                />
              )
          )}
        </div>
      )}
      {isDragging && isDraggingOver && (
        <div className={s.dragOverIndicator}></div>
      )}
    </div>
  );
}
