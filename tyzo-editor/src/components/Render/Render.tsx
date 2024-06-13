import { Fragment } from "react";
import type {
  ComponentInfo,
  ComponentProperty,
  ElementContainer,
  PageElement,
  PageElementId,
  StringProperty,
} from "../../types";
import { randomId } from "../../util/id";

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
  isEditMode,
  preElement,
  preChildElement,
  afterChildElement,
  tepmlateFunction,
  props,
}: {
  elementContainer: ElementContainer;
  elements: PageElementId[];
  componentsById: Record<string, ComponentInfo | undefined>;
  isEditMode: boolean;
  preElement?: (element: PageElement) => React.ReactNode;
  preChildElement?: (element: PageElement) => React.ReactNode;
  afterChildElement?: (element: PageElement) => React.ReactNode;
  tepmlateFunction:
    | ((templateString: string, props: Record<string, any>) => string)
    | undefined;
  props: Record<string, any>;
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
        const childrenData: Record<
          string,
          React.JSX.Element | React.JSX.Element[]
        > = {};
        const overriddenData = el.data
          ? JSON.parse(JSON.stringify(el.data)) // This is a proxy object since we're usig yjs, structuredClone doesn't work :(
          : {};
        for (const key of Object.keys(properties)) {
          if (properties[key].type === "children") {
            // We want to interfere as little as possible with the DOM when rendering children
            // That's why we are doing it like this, so we get one element per child, which at least makes stuff like `children.map` work
            if (!el.children || el.children.length === 0) {
              childrenData[key] = (
                <>
                  {preChildElement?.(el) ?? null}
                  <Render
                    elementContainer={elementContainer}
                    elements={el.children ?? []}
                    componentsById={componentsById}
                    isEditMode={isEditMode}
                    preElement={preElement}
                    preChildElement={preChildElement}
                    afterChildElement={afterChildElement}
                    props={props}
                    tepmlateFunction={tepmlateFunction}
                  />
                  {afterChildElement?.(el) ?? null}
                </>
              );
            } else {
              childrenData[key] = el.children.map((child, i) => {
                if (i === 0 && i === el.children!.length - 1) {
                  return (
                    <Fragment key={child}>
                      {preChildElement?.(el) ?? null}
                      <Render
                        elementContainer={elementContainer}
                        elements={[child]}
                        componentsById={componentsById}
                        isEditMode={isEditMode}
                        preElement={preElement}
                        preChildElement={preChildElement}
                        afterChildElement={afterChildElement}
                        props={props}
                        tepmlateFunction={tepmlateFunction}
                      />
                      {afterChildElement?.(el) ?? null}
                    </Fragment>
                  );
                }
                if (i === 0) {
                  return (
                    <Fragment key={child}>
                      {preChildElement?.(el) ?? null}
                      <Render
                        elementContainer={elementContainer}
                        elements={[child]}
                        componentsById={componentsById}
                        isEditMode={isEditMode}
                        preElement={preElement}
                        preChildElement={preChildElement}
                        afterChildElement={afterChildElement}
                        props={props}
                        tepmlateFunction={tepmlateFunction}
                      />
                    </Fragment>
                  );
                }
                if (i === el.children!.length - 1) {
                  return (
                    <Fragment key={child}>
                      <Render
                        elementContainer={elementContainer}
                        elements={[child]}
                        componentsById={componentsById}
                        isEditMode={isEditMode}
                        preElement={preElement}
                        preChildElement={preChildElement}
                        afterChildElement={afterChildElement}
                        props={props}
                        tepmlateFunction={tepmlateFunction}
                      />
                      {afterChildElement?.(el) ?? null}
                    </Fragment>
                  );
                }
                return (
                  <Render
                    key={child}
                    elementContainer={elementContainer}
                    elements={[child]}
                    componentsById={componentsById}
                    isEditMode={isEditMode}
                    preElement={preElement}
                    preChildElement={preChildElement}
                    afterChildElement={afterChildElement}
                    props={props}
                    tepmlateFunction={tepmlateFunction}
                  />
                );
              });
            }
          }
          visitPropertyDeep(
            properties[key],
            overriddenData?.[key],
            (property, parentData, key) => {
              if (
                property.type === "richText"
                // || (property.type === "string" &&
                // "editor" in property &&
                // (property as StringProperty).editor === "richText" &&
                // parentData?.[key])
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
          if (
            tepmlateFunction &&
            properties?.[key].type === "string" &&
            !(properties?.[key] as StringProperty).dontInterpolate
          ) {
            const template = el.data[key] ?? "";
            textData[key] = tepmlateFunction(template, props);
          }
          if (properties?.[key].type === "template") {
            const elementContainer = (el.data[key] as
              | ElementContainer
              | undefined) ?? {
              id: randomId(),
              children: [],
              elements: {},
            };
            const Comp = (props: any) => (
              <Render
                elementContainer={elementContainer}
                elements={elementContainer.children}
                componentsById={componentsById}
                isEditMode={false}
                props={props}
                tepmlateFunction={tepmlateFunction}
              />
            );
            overriddenData[key] = Comp;
          }
        }
        return (
          <Fragment key={el.id}>
            {preElement?.(el) ?? null}
            <Comp
              {...overriddenData}
              {...textData}
              {...childrenData}
              tyzo={{
                ...el,
                isEditMode,
              }}
            />
          </Fragment>
        );
      })}
    </>
  );
}
