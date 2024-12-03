import { z } from "zod";

export type Id = string | number;

export type Collection<T> = {
  name: string;
  idField: keyof T;
  schema: z.ZodType<T>;
};

export type Global<T> = {
  name: string;
  schema: z.ZodType<T>;
};

export type CollectionReference<T = any> = Collection<T> | string;
export type GlobalReference<T = any> = Global<T> | string;

// Helper type to extract the inferred type from a collection reference
export type CollectionType<T> = T extends Collection<infer U>
  ? U
  : T extends string
  ? any
  : never;

// Helper type to extract the inferred type from a global reference
export type GlobalType<T> = T extends Global<infer U>
  ? U
  : T extends string
  ? any
  : never;

export interface Asset {
  name: string;
  key: string;
  size: number;
  httpMetadata?: Record<string, string>;
  etag?: string;
  httpEtag?: string;
}
