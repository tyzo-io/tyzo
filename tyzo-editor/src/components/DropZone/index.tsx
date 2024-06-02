import { useState } from "react";
import s from "./DropZone.module.css";
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
  const { isDragging, setIsDragging } = useEditor();
  const { componentsById } = useComponents();
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const { translations} = useTranslations()
  return (
    <div
      className={classNames(
        s.dropZone,
        isDragging && s.isDragging,
        isDraggingOver && s.hover
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
          addNewElement(elementContainer, Comp, parentId);
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
