import { z } from "zod";

export type Id = string | number;

export type Collection<
  T extends z.ZodObject<any> = z.ZodObject<any>,
  Name extends string = string
> = {
  name: Name;
  idField: keyof T["shape"];
  schema: T;
};

export type Global<
  T extends z.ZodObject<any> = z.ZodObject<any>,
  Name extends string = string
> = {
  name: Name;
  schema: T;
};

export type RelationshipDef<T, Schema> = Schema & {
  _ValueType: T;
};

export type PickRelationshipValues<T extends z.ZodObject<any>> = {
  [K in keyof T["shape"] as T["shape"][K] extends {
    _ValueType: any;
  }
    ? K
    : never]: T["shape"][K] extends {
    _ValueType: infer U;
  }
    ? U
    : never;
};

export type RelationshipsFlags<T extends z.ZodObject<any>> = {
  [key in keyof PickRelationshipValues<T>]?: boolean;
};

export type RelationshipsNames<T extends z.ZodObject<any>> =
  (keyof PickRelationshipValues<T>)[];

export type CollectionReference = Collection<any> | string;
export type GlobalReference = Global<any> | string;

// Helper type to extract the inferred type from a collection reference
export type CollectionEntry<T> = T extends Collection<infer U>
  ? z.infer<U>
  : T extends string
  ? any
  : never;

// Helper type to extract the inferred type from a global reference
export type GlobalValue<T> = T extends Global<infer U>
  ? z.infer<U>
  : T extends string
  ? any
  : never;

export interface Asset {
  name: string;
  key: string;
  size: number;
  httpMetadata?: Record<string, string>;
  metadata?: {
    width?: number;
    height?: number;
  };
  etag?: string;
  httpEtag?: string;
}
