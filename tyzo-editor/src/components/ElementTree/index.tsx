import { ElementTreeItem } from "./ElementTreeItem";
import { useComponents } from "../../useComponents";
import { ElementContainer } from "../../types";

export function ElementTree({
  elementsContainer,
}: {
  elementsContainer: ElementContainer;
}) {
  const { components } = useComponents();
  return (
    <>
      <p style={{ margin: "0.5em", fontWeight: "bold" }}>Content</p>
      {elementsContainer.children.map(
        (elId) =>
          elementsContainer.elements[elId] && (
            <ElementTreeItem
              key={elId}
              element={elementsContainer.elements[elId]!}
              elementContainer={elementsContainer}
              components={components}
            ></ElementTreeItem>
          )
      )}
    </>
  );
}
