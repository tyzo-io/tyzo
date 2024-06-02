import { Fragment } from "react";
import type {
  ComponentInfo,
  ComponentProperty,
  ElementContainer,
  PageElement,
  PageElementId,
  StringProperty,
} from "../../types";

function getComponent(
  componentId: string,
  componentsById: Record<
    string,
    | (ComponentInfo & {
        component: (props?: any) => React.ReactNode;
      })
    | undefined
  >
) {
  if (componentId.startsWith("global:")) {
    return {
      Comp: componentId,
      properties: {
        children: { type: "children", name: "children", defaultData: [] },
      } as Record<string, ComponentProperty>,
    };
  }
  const component = componentsById[componentId];
  const Comp = component?.component;
  return {
    Comp,
    component,
    properties: component?.properties ?? {},
  };
}

function visitPropertyDeep(
  property: ComponentProperty,
  data: any,
  callback: (
    prop: ComponentProperty,
    parentData: any,
    key: string | number
  ) => void,
  parentData?: any,
  key?: string | number
) {
  if (parentData && key) {
    callback(property, parentData, key);
  }

  if (property.type === "object" && "fields" in property) {
    for (const subProp of Object.values(property.fields)) {
      visitPropertyDeep(
        subProp,
        data?.[subProp.name],
        callback,
        data,
        subProp.name
      );
    }
  }
  if (property.type === "array" && "items" in property) {
    for (const i in data ?? []) {
      const item = data[i];
      visitPropertyDeep(property.items, item, callback, data, i);
    }
  }
}

export function Render({
  elementContainer,
  elements,
  componentsById,
  preElement,
  preChildElement,
  afterChildElement,
}: {
  elementContainer: ElementContainer;
  elements: PageElementId[];
  componentsById: Record<string, ComponentInfo | undefined>;
  isDragging?: boolean;
  preElement?: (element: PageElement) => React.ReactNode;
  preChildElement?: (element: PageElement) => React.ReactNode;
  afterChildElement?: (element: PageElement) => React.ReactNode;
}) {
  return (
    <>
      {elements.map((elId) => {
        const el = elementContainer.elements[elId];
        if (!el) {
          return null;
        }
        const { Comp, properties } = getComponent(
          el.componentId,
          componentsById
        );
        if (!Comp) {
          return null;
        }
        const textData: Record<string, string> = {};
        const childrenData: Record<string, React.JSX.Element> = {};
        const overriddenData = el.data
          ? JSON.parse(JSON.stringify(el.data)) // This is a proxy object since we're usig yjs, structuredClone doesn't work :(
          : {};
        for (const key of Object.keys(properties)) {
          if (properties[key].type === "children") {
            childrenData[key] = (
              <>
                {preChildElement?.(el) ?? null}
                <Render
                  elementContainer={elementContainer}
                  elements={el.children ?? []}
                  componentsById={componentsById}
                />
                {afterChildElement?.(el) ?? null}
              </>
            );
          }
          visitPropertyDeep(
            properties[key],
            overriddenData?.[key],
            (property, parentData, key) => {
              if (
                property.type === "richText" ||
                (property.type === "string" &&
                  "editor" in property &&
                  (property as StringProperty).editor === "richText" &&
                  parentData?.[key])
              ) {
                parentData[key] = (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: parentData?.[key].html ?? "",
                    }}
                  ></div>
                );
              }
            },
            overriddenData,
            key
          );
          // if (component.properties?.[key].type === "string") {
          //   // do interpolation with `data`
          //   const template = el.data[key] ?? "";
          //   textData[key] = templateString(template, data);
          // }
        }
        return (
          <Fragment key={el.id}>
            {preElement?.(el) ?? null}
            <Comp
              {...overriddenData}
              {...textData}
              {...childrenData}
              tyzo={el}
            />
          </Fragment>
        );
      })}
    </>
  );
}
