import { Fragment } from "react";
import type {
  ChildrenProperty,
  ComponentInfo,
  ComponentProperty,
  ElementContainer,
  PageElement,
  PageElementId,
  StringProperty,
} from "../../types";
import { randomId } from "../../util/id";
import { RenderProps } from "./types";

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

export function RenderElement({
  elementContainer,
  elementId,
  componentsById,
  isEditMode,
  preElement,
  preChildElement,
  afterChildElement,
  tepmlateFunction,
  props,
}: {
  elementContainer: ElementContainer;
  elementId: PageElementId;
  componentsById: Record<string, ComponentInfo | undefined>;
  isEditMode: boolean;
  preElement?: (element: PageElement) => React.ReactNode;
  preChildElement?: (
    propertyName: string,
    element: PageElement,
    property: ChildrenProperty
  ) => React.ReactNode;
  afterChildElement?: (
    propertyName: string,
    element: PageElement,
    property: ChildrenProperty
  ) => React.ReactNode;
  tepmlateFunction:
    | ((templateString: string, props: Record<string, any>) => string)
    | undefined;
  props: Record<string, any>;
}) {
  const el = elementContainer.elements[elementId];
  if (!el) {
    return null;
  }
  const { Comp, properties } = getComponent(el.componentId, componentsById);
  if (!Comp) {
    return null;
  }
  const textData: Record<string, string> = {};
  const childrenData: Record<string, React.JSX.Element | React.JSX.Element[]> =
    {};
  const overriddenData = el.data
    ? JSON.parse(JSON.stringify(el.data)) // This is a proxy object since we're usig yjs, structuredClone doesn't work :(
    : {};
  for (const key of Object.keys(properties)) {
    const property = properties[key];
    if (property.type === "children") {
      const childProperty = property as ChildrenProperty;
      // We want to interfere as little as possible with the DOM when rendering children
      // That's why we are doing it like this, so we get one element per child, which at least makes stuff like `children.map` work
      const children = el.childrenByProperty?.[key];
      if (!children || children.length === 0) {
        childrenData[key] = (
          <>
            {preChildElement?.(key, el, childProperty) ?? null}
            <Render
              elementContainer={elementContainer}
              elements={children ?? []}
              componentsById={componentsById}
              isEditMode={isEditMode}
              preElement={preElement}
              preChildElement={preChildElement}
              afterChildElement={afterChildElement}
              props={props}
              tepmlateFunction={tepmlateFunction}
            />
            {afterChildElement?.(key, el, childProperty) ?? null}
          </>
        );
      } else {
        childrenData[key] = children.map((child, i) => {
          if (i === 0 && i === children!.length - 1) {
            return (
              <Fragment key={child}>
                {preChildElement?.(key, el, childProperty) ?? null}
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
                {afterChildElement?.(key, el, childProperty) ?? null}
              </Fragment>
            );
          }
          if (i === 0) {
            return (
              <Fragment key={child}>
                {preChildElement?.(key, el, childProperty) ?? null}
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
          if (i === children!.length - 1) {
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
                {afterChildElement?.(key, el, childProperty) ?? null}
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

      const templateData = {
        elementContainer: elementContainer,
        elements: elementContainer.children,
        componentsById: componentsById,
        isEditMode: false,
        props: props,
        tepmlateFunction: tepmlateFunction,
      };
      overriddenData[key] = templateData;
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
}: RenderProps) {
  return (
    <>
      {elements.map((elId) => (
        <RenderElement
          key={elId}
          elementContainer={elementContainer}
          elementId={elId}
          componentsById={componentsById}
          isEditMode={isEditMode}
          preElement={preElement}
          preChildElement={preChildElement}
          afterChildElement={afterChildElement}
          tepmlateFunction={tepmlateFunction}
          props={props}
        />
      ))}
    </>
  );
}
