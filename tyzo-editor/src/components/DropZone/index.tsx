import { useState } from "react";
import { useEditor } from "../Editor/EditorContext";
import { classNames } from "../../util/classNames";
import { ComponentId, ElementContainer, PageElementId } from "../../types";
import { useComponents } from "../../useComponents";
import { addNewElement, moveElement } from "../../operations";
import { useTranslations } from "../../i18n";

export function DropZone({
  label,
  elementContainer,
  parentId,
}: {
  label?: string;
  elementContainer: ElementContainer;
  parentId: PageElementId | undefined;
}) {
  const { isDragging, setIsDragging, setFocusedItem } = useEditor();
  const { componentsById } = useComponents();
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const { translations } = useTranslations();
  return (
    <div
      className={classNames(
        "tyzoDropZone",
        isDragging && "tyzoIsDragging",
        isDraggingOver && "tyzoHover"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (!isDraggingOver) {
          setIsDraggingOver(true);
        }
      }}
      onDragLeave={() => {
        setIsDraggingOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
        setIsDragging(false);

        const componentId = e.dataTransfer.getData("tyzo/component-id") as
          | ComponentId
          | undefined;
        const Comp = componentId && componentsById[componentId];
        if (Comp) {
          const el = addNewElement(elementContainer, Comp, parentId);
          setFocusedItem({ id: el.id, isFromTree: false, isClick: false });
          return;
        }

        const elementId = e.dataTransfer.getData("tyzo/element-id") as
          | PageElementId
          | undefined;
        const el = elementId && elementContainer.elements[elementId];
        if (el) {
          moveElement(elementContainer, elementId, parentId);
        }
      }}
    >
      {translations.dropHere.replace("{{}}", label ? label + " " : "")}
    </div>
  );
}

export function DropZoneStyle() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `.tyzoDropZone {
    text-align: center;
    margin: 1em;
    padding: 1em;
    border-radius: 10px;
    border: 3px dashed var(--bg-color-elevated);
    display: none;
}

.tyzoDropZone.tyzoIsDragging {
    display: block;
    --theme-secondary: #3a64d8;
    border: 1px dashed var(--theme-secondary);
}

.tyzoHover {
    --theme-surface-1: #3a64d831;
    background-color: var(--theme-surface-1);
}`,
      }}
    ></style>
  );
}
