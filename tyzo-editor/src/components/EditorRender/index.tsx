import { DropZone } from "../DropZone";
import type {
  ComponentInfo,
  ElementContainer,
  PageElementId,
} from "../../types";
import { Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Render as PageRender } from "../Render/Render";
import { useTranslations } from "../../i18n";

function HackTyzoIdAttribute({ id }: { id: string }) {
  const [didHack, setDidHack] = useState(false);
  return (
    // This only works for single element components
    <Fragment>
      {!didHack && (
        <div
          ref={(el) => {
            if (
              el?.nextSibling &&
              !didHack &&
              !(el.nextSibling as HTMLElement).getAttribute("data-tyzo-id")
            ) {
              (el.nextSibling as HTMLElement).setAttribute("data-tyzo-id", id);
              setDidHack(true);
            }
          }}
          dangerouslySetInnerHTML={{
            __html: `<!-- data-tyzo-id="${id}" -->`,
          }}
        ></div>
      )}
    </Fragment>
  );
}

export function Render({
  elementContainer,
  elements,
  componentsById,
  isDragging,
  templateFunction,
  props,
}: {
  elementContainer: ElementContainer;
  elements: PageElementId[];
  componentsById: Record<string, ComponentInfo | undefined>;
  isDragging?: boolean;
  templateFunction:
    | ((template: string, props: Record<string, any>) => string)
    | undefined;
  props: Record<string, any>;
}) {
  const { translations } = useTranslations();
  return (
    <PageRender
      elementContainer={elementContainer}
      elements={elements}
      componentsById={componentsById}
      isEditMode={true}
      props={props}
      tepmlateFunction={templateFunction}
      preElement={(el) => <HackTyzoIdAttribute id={el.id} />}
      preChildElement={(key, el, property) =>
        (el.childrenByProperty?.[key]?.length ?? 0) === 0 && (
          <div
            style={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0.7,
              margin: "1em",
            }}
          >
            {!property.noEmptyLabel &&
              translations.containerEmpty.replace(
                "{{}}",
                componentsById[el.componentId]?.name ?? el.componentId
              )}
          </div>
        )
      }
      afterChildElement={(key, el) => {
        if (isDragging) {
          return (
            <DropZone
              label={componentsById[el.componentId]?.name}
              elementContainer={elementContainer}
              parent={{ id: el.id, propertyName: key }}
            />
          );
        }
        return null;
      }}
    />
  );
}
