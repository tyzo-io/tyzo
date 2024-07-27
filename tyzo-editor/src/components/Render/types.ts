import {
  ComponentInfo,
  ChildrenProperty,
  ElementContainer,
  PageElement,
  PageElementId,
} from "../../types";

export type RenderProps = {
  elementContainer: ElementContainer;
  elements: PageElementId[];
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
};
