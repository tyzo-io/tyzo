import { ElementTreeItem } from "./ElementTreeItem";
import { useComponents } from "../../useComponents";
import { ElementContainer } from "../../types";
import { useTranslations } from "../../i18n";

export function ElementTree({
  elementsContainer,
}: {
  elementsContainer: ElementContainer;
}) {
  const { components } = useComponents();
  const { translations } = useTranslations();
  return (
    <>
      <p style={{ margin: "0.5em", fontWeight: "bold" }}>
        {translations.content}
      </p>
      {!elementsContainer.children.length && (
        <p
          style={{
            margin: "1em",
            textAlign: "center",
            fontSize: "0.9em",
            opacity: 0.7,
          }}
        >
          {translations.noElements}
        </p>
      )}
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
