export type PaginationParams = {
  includeTotalCount?: boolean;
  limit?: number;
  offset?: number;
  after?: string;
  before?: string;
};

type GenericDataObject<IdType = string | number> = {
  id: IdType;
} & {
  [key: string]: unknown;
};

// export type DataRecord<T extends GenericDataObject> = {
//   id: string;
//   modelName: string;
//   properties: T;
// };

// export type DataModelDefinition<Name extends string> = {
//   name: Name;
//   properties: Property[];
// };

export type DataModel<
  T extends GenericDataObject = any,
  Name extends string = string
> = {
  name: Name;
  list: (options?: {
    // filters?: Filters<T>,
    filters?: { treeId?: { equals?: string }; userId?: { equals?: string } };
    pagination?: PaginationParams;
  }) => Promise<{ data: T[]; totalCount?: number }>;
  get: (id: T["id"]) => Promise<T>;
  add: (data: T) => Promise<T>;
  update: (id: T["id"], fields: Partial<Omit<T, "id">>) => Promise<void>;
  remove: (id: T["id"]) => Promise<void>;
};

export type ModelStore<
  ModelMap extends { [key: string]: GenericDataObject } = Record<
    string,
    GenericDataObject
  >
> = {
  listModels: () => // store: DataConnectionMetaStore,
  // filters?: Filters<DataModel>
  Promise<
    DataModel<
      ModelMap[keyof ModelMap],
      // @ts-expect-error This complains that the key could be a number or string, which is incorrect since we already told it that keys are a string
      keyof ModelMap
    >[]
  >;
  getModel: <ModelName extends keyof ModelMap & string>(
    name: ModelName
  ) => Promise<DataModel<ModelMap[ModelName], ModelName>>;
  saveModel: (
    model: DataModel<ModelMap[keyof ModelMap]>
    // store: DataConnectionMetaStore
  ) => Promise<void>;
  removeModel: <ModelName extends keyof ModelMap>(
    name: ModelName
    // store: DataConnectionMetaStore
  ) => Promise<void>;
};

// !@ts-expect-error
// const test: TyzoConfig | undefined;
// const model = await test?.modelStore.getModel("Page");
// // model?.addData({ id: "1", title: "title", path: "path" });
// // model!.addData({ id: "1", title: "title", path: "path" });
// const models = await test?.modelStore.listModels();
// models?.[0].name;

export type FileStore = {
  // get: (key: string) => Promise<Blob>;
  add: (key: string, file: Blob) => Promise<{ url: string }>;
  // remove: (key: string) => Promise<void>;
};