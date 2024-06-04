import { Branded } from "./brand";

export type ComponentId = Branded<string, "ComponentId">;

export type ObjectProperty = {
  name: string;
  type: "object";
  fields: Record<string, ComponentProperty>;
  defaultData?: NonNullable<unknown>;
};

export type ArrayProperty = {
  name: string;
  type: "array";
  items: ComponentProperty;
  defaultItem: NonNullable<unknown>;
  defaultData: NonNullable<unknown>[];
};

export type FunctionProperty = {
  name: string;
  type: "function";
};

export type StringProperty = {
  name: string;
  type: "string";
  defaultData: {
    html: string;
    engine: "lexical.dev";
    blocks: any;
  };
  enum?: string[];
  editor?: "richText";
};

export type RichTextProperty = {
  name: string;
  type: "richText";
  defaultData: {
    html: string;
    // engine: "lexical.dev";
    // engine: "blocknotejs.org";
    engine: "editorjs.io";
    blocks: any;
  };
};

export type PlainProperty = {
  name: string;
  type: string;
  defaultData: any;
};

export type ComponentProperty =
  | PlainProperty
  | RichTextProperty
  | StringProperty
  | ArrayProperty
  | ObjectProperty
  | FunctionProperty;

export type StoredComponentInfo = {
  id: ComponentId;
  groupName: string
  // source:
  //   | {
  //       type: "file";
  //       path: string;
  //       content?: string;
  //     }
  //   | {
  //       type: "builtin";
  //       content?: string;
  //     };
  name: string;
  properties?: Record<string, ComponentProperty>;
};

export type ComponentInfo = StoredComponentInfo & {
  component: (props?: any) => React.ReactNode;
};

export type ComponentGroupId = Branded<string, "ComponentGroupId">;

export type ComponentGroup = { id: ComponentGroupId; name: string };

export type PageElementId = Branded<string, "PageElementId">;

export interface PageElement {
  id: PageElementId;
  componentId: ComponentId;
  data?: any;
  parent?: PageElementId;
  children?: PageElementId[];
}

export interface ElementContainer {
  elements: Record<string, PageElement | undefined>;
  children: PageElementId[];
}

export type PageId = Branded<string, "PageId">;

export interface Page extends ElementContainer {
  id: PageId;
  name: string;
  path: string;
  title: string;
}

export type EditorInput<
  T extends {
    property: ComponentProperty;
    element: PageElement;
    elementContainer: ElementContainer;
    components: ComponentInfo[];
    inputs: InputMap;
    value: any;
    setValue: (value: any) => void;
  }
> = (props: T) => React.ReactNode | null;

export type InputMap = Record<string, EditorInput<any>>;

export type EditorBackend = {
  loadComponentGroups(): Promise<ComponentGroup[]>;
  loadComponents(): Promise<ComponentInfo[]>;
  saveComponentInfo(info: StoredComponentInfo): Promise<void>;
  loadPages(): Promise<Page[]>;
  loadPage(id: string): Promise<Page | null>;
  savePage(page: Page, componentInfos: ComponentInfo[]): Promise<void>;

  shouldAutoSave?: boolean;
  inputs: InputMap;
  supportsUpdatingComponents: boolean;
};

// export type RuntimeLoader = {
//   loadComponentGroups(): ComponentGroup[];
//   loadComponents(): (ComponentInfo & {
//     component: (props?: any) => React.ReactNode;
//   })[];
//   inputs: InputMap;
// };

// export type ServerLoader = {
//   // basePath: string;
//   supportsUpdatingComponents: boolean;
//   loadComponentInfos(): Promise<ComponentInfo[]>;
//   loadPage(id: string): Promise<Page | null>;
//   loadPages(): Promise<Page[]>;
//   saveComponentInfo(info: Omit<ComponentInfo, "id">): Promise<void>;
//   savePage(page: Page, componentInfos: ComponentInfo[]): Promise<void>;
// };
