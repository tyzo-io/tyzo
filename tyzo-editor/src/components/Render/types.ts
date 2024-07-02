import {
  ComponentInfo,
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
  preChildElement?: (element: PageElement) => React.ReactNode;
  afterChildElement?: (element: PageElement) => React.ReactNode;
  tepmlateFunction:
    | ((templateString: string, props: Record<string, any>) => string)
    | undefined;
  props: Record<string, any>;
};
