export { z } from "zod";
import { z } from "zod";
import type { Collection, Global, Id } from "./types";
import { apiClient } from "./apiClient/values";
import type { Where } from "./filters";
import type { Sort } from "./sort";

export type { Where } from "./filters";
export { whereSchema } from "./filters";
export type { Sort } from "./sort";
export { sortSchema } from "./sort";

const collections: Record<string, Collection<any>> = {};
const globals: Record<string, Global<any>> = {};

export function isLocal() {
  return process.env.DEV === "true";
}

const apiUrl = process.env.TYZO_API_URL ?? "http://localhost:3456/api";

const client = apiClient({
  // API_URL: import.meta.env.VITE_API_URL,
  API_URL: apiUrl,
});

export function defineCollection<T>(options: {
  name: string;
  idField: keyof T;
  schema: z.ZodType<T>;
}): Collection<T> {
  const collection = {
    name: options.name,
    idField: options.idField,
    schema: options.schema,
  };
  collections[collection.name] = collection;
  return collection;
}

export function defineGlobal<T>(options: {
  name: string;
  schema: z.ZodType<T>;
}): Global<T> {
  const global = {
    name: options.name,
    schema: options.schema,
  };
  globals[global.name] = global;
  return global;
}

export type InferredCollectionItem<C extends Collection<any>> = z.infer<
  C["schema"]
>;
//  & {
//   _id: string;
//   _createdAt: Date;
//   _updatedAt: Date;
// };

export async function getEntries<C extends Collection<any>>(
  collection: C,
  options?: {
    includeCount?: boolean;
    limit?: number;
    offset?: number;
    filters?: Where<InferredCollectionItem<C>>;
    sort?: Sort<InferredCollectionItem<C>>;
  }
): Promise<{ entries: InferredCollectionItem<C>[] }> {
  const entries = await client.getEntries(collection.name, options);
  return entries as {
    entries: InferredCollectionItem<C>[];
    limit: number;
    offset: number;
    count?: number;
  };
}

export async function getEntry<C extends Collection<any>>(
  collection: C,
  id: Id
): Promise<{ entry: InferredCollectionItem<C> }> {
  const entry = await client.getEntry(collection.name, id);
  return entry as { entry: InferredCollectionItem<C> };
}

export type InferredGlobalItem<G extends Global<any>> = z.infer<G["schema"]>;

export async function getGlobal<G extends Global<any>>(global: G) {
  const globalData = await client.getGlobalValue(global.name);
  return globalData as { global: InferredGlobalItem<G> };
}

export async function getAsset(filename: string) {
  const assetData = await client.getAsset(filename);
  return assetData;
}

export function makeAssetUrl(
  filepath: string,
  options?: {
    width?: number;
    height?: number;
    format?: "avif" | "webp" | "jpeg" | "png";
    quality?: number;
  }
) {
  const query = new URLSearchParams();
  if (options?.width) query.set("width", options.width.toString());
  if (options?.height) query.set("height", options.height.toString());
  if (options?.format) query.set("format", options.format);
  if (options?.quality) query.set("quality", options.quality.toString());
  if (query.toString()) {
    return `${apiUrl}/assets/${filepath}?${query.toString()}`;
  }
  return `${apiUrl}/assets/${filepath}`;
}

export const linkSchema = z.object({
  url: z.string(),
  linkType: z
    .enum(["internal", "external", "anchor", "mailto", "tel"])
    .optional(),
});

const isLinkSymbol = Symbol.for("isLink");
(linkSchema as any)[isLinkSymbol] = true;

export function isLink(schema: z.AnyZodObject) {
  return (schema as any)[isLinkSymbol];
}

export const imageSchema = z.object({
  url: z.string(),
  alt: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  sizes: z.string().optional(),
  srcset: z.string().optional(),
  loading: z.enum(["eager", "lazy"]).optional(),
});

const isImageSymbol = Symbol.for("isImage");
(imageSchema as any)[isImageSymbol] = true;

export function isImage(schema: z.AnyZodObject) {
  return (schema as any)[isImageSymbol];
}

export const videoSchema = z.object({
  url: z.string(),
  alt: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

const isVideoSymbol = Symbol.for("isVideo");
(videoSchema as any)[isVideoSymbol] = true;

export function isVideo(schema: z.AnyZodObject) {
  return (schema as any)[isVideoSymbol];
}

export const assetSchema = z.object({
  url: z.string(),
});

const isAssetSymbol = Symbol.for("isAsset");
(assetSchema as any)[isAssetSymbol] = true;

export function isAsset(schema: z.AnyZodObject) {
  return (schema as any)[isAssetSymbol];
}

export const richTextSchema = z.array(z.any());

const isRichTextSymbol = Symbol.for("isRichText");
(richTextSchema as any)[isRichTextSymbol] = true;

export function isRichText(schema: z.ZodType<any>) {
  return (schema as any)[isRichTextSymbol];
}

export const markdownSchema = z.object({
  markdown: z.string(),
});

const isMarkdownSymbol = Symbol.for("isMarkdown");
(markdownSchema as any)[isMarkdownSymbol] = true;

export function isMarkdown(schema: z.ZodType<any>) {
  return (schema as any)[isMarkdownSymbol];
}
