export { z } from "zod";
import { z } from "zod";
import type {
  Collection,
  CollectionEntry,
  Global,
  GlobalValue,
  Id,
  PickRelationshipValues,
  RelationshipsFlags,
} from "./types";
import { apiClient } from "./apiClient/values";
import type { Where } from "./filters";
import type { Sort } from "./sort";

export type { Where } from "./filters";
export { whereSchema } from "./filters.js";
export type { Sort } from "./sort";
export { sortSchema } from "./sort.js";

/**
 * Loads a variable from env, if it exists. Tries to load it for nextjs, and vite
 * 
 */
function getEnv(key: string, defaultValue?: string) {
  if (typeof process !== "undefined") {
    let value = process.env[key];
    if (value !== undefined) {
      return value;
    }
    value = process.env[`NEXT_PUBLIC_${key}`];
    if (value !== undefined) {
      return value;
    }
    value = process.env[`VITE_${key}`];
    if (value !== undefined) {
      return value;
    }
  }
  // @ts-expect-error
  if (import.meta && import.meta.env) {
    // @ts-expect-error
    if (import.meta.env[key]) {
      // @ts-expect-error
      return import.meta.env[key];
    }
    // @ts-expect-error
    if (import.meta.env[`VITE_${key}`]) {
      // @ts-expect-error
      return import.meta.env[`VITE_${key}`];
    }
  }
  return defaultValue;
}

export function isLocal() {
  return getEnv("DEV", "false") === "true";
}

const spaceSlug = getEnv("TYZO_SPACE");
const stageSlug = getEnv("TYZO_STAGE", "main");
// const apiUrl = getEnv("TYZO_API_URL", "http://localhost:3456/api");
const apiUrl = getEnv(
  "TYZO_API_URL",
  `https://cd.tyzo.io/content/${spaceSlug}:${stageSlug}`
);

const client = apiClient({
  API_URL: apiUrl,
});

export function defineCollection<
  Name extends string,
  T extends z.ZodObject<any>
>(collection: {
  name: Name;
  idField: keyof T["shape"];
  schema: T;
}): Collection<T, Name> {
  return collection;
}

export function defineGlobal<
  Name extends string,
  T extends z.ZodObject<any>
>(global: { name: Name; schema: T }): Global<T, Name> {
  return global;
}

export async function getEntries<
  C extends Collection<any>,
  I extends C extends Collection<infer T, infer U>
    ? RelationshipsFlags<T>
    : Record<string, boolean>
>(
  collection: C,
  options?: {
    includeCount?: boolean;
    include?: I;
    limit?: number;
    offset?: number;
    filters?: Where<CollectionEntry<C>>;
    sort?: Sort<CollectionEntry<C>>;
  }
) {
  const entries = await client.getEntries(collection.name, {
    include: options?.include ? Object.keys(options.include) : undefined,
  });
  return entries as {
    entries: (CollectionEntry<C> & {
      [key in keyof I]: {
        entry: C extends Collection<infer T, infer U>
          ? // @ts-expect-error not sure how to fix this, but type inference still works right
            PickRelationshipValues<T>[key]
          : {};
      };
    })[];
    limit: number;
    offset: number;
    count?: number;
  };
}

export async function getEntry<
  C extends Collection<any>,
  I extends C extends Collection<infer T, infer U>
    ? RelationshipsFlags<T>
    : Record<string, boolean>
>(
  collection: C,
  id: Id,
  options?: {
    include?: I;
  }
) {
  let include: string[] | undefined;
  if (options?.include) {
    include = Object.keys(options.include);
  }

  const entry = await client.getEntry(collection.name, id, { include });
  return entry as {
    entry: CollectionEntry<C> & {
      [key in keyof I]: {
        entry: C extends Collection<infer T, infer U>
          ? // @ts-expect-error not sure how to fix this, but type inference still works right
            PickRelationshipValues<T>[key]
          : {};
      };
    };
  };
}

export async function getGlobal<
  G extends Global<any>,
  I extends G extends Global<infer T, infer U>
    ? RelationshipsFlags<T>
    : Record<string, boolean>
>(
  global: G,
  options?: {
    include?: I;
  }
) {
  const include = options?.include ? Object.keys(options.include) : undefined;
  const globalData = await client.getGlobalValue(global.name, { include });
  return globalData as {
    global: GlobalValue<G> & {
      [key in keyof I]: {
        entry: G extends Global<infer T, infer U>
          ? // @ts-expect-error not sure how to fix this, but type inference still works right
            PickRelationshipValues<T>[key]
          : {};
      };
    };
  };
}

export async function getAsset(filename: string) {
  const assetData = await client.getAsset(filename);
  return assetData;
}

export function makeAssetUrl(
  filepath: string,
  options?: {
    baseUrl?: string;
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
  const baseUrl = options?.baseUrl ?? apiUrl;
  if (query.toString()) {
    return `${baseUrl}/assets/${filepath}?${query.toString()}`;
  }
  return `${baseUrl}/assets/${filepath}`;
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

type Relationship<T, Schema> = Schema & {
  _ValueType: T;
};

export function entryReference<T extends Collection<any>>(
  collection: T["name"]
) {
  const schema = z.object({
    id: z.string(),
    collection: z.literal(collection),
  });
  (schema._def as any)[isEntryReferenceSymbol] = true;
  (schema as any)[isEntryReferenceSymbol] = true;
  return schema as Relationship<CollectionEntry<T>, typeof schema>;
}

const isEntryReferenceSymbol = Symbol.for("isEntryReference");

export function isEntryReference(schema: z.ZodTypeDef) {
  return (schema as any)[isEntryReferenceSymbol];
}

export const assetReference = z.object({
  key: z.string().optional(),
});

export const imageSchema = assetReference.and(
  z.object({
    url: z.string(),
    alt: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    sizes: z.string().optional(),
    srcset: z.string().optional(),
    loading: z.enum(["eager", "lazy"]).optional(),
  })
);

export type ImageType = z.infer<typeof imageSchema>;

const isImageSymbol = Symbol.for("isImage");
(imageSchema as any)[isImageSymbol] = true;
(imageSchema._def as any)[isImageSymbol] = true;

export function isImage(schema: z.ZodTypeDef | z.ZodTypeDef) {
  return (schema as any)[isImageSymbol];
}

export const videoSchema = assetReference.and(
  z.object({
    url: z.string(),
    alt: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
  })
);

export type VideoType = z.infer<typeof videoSchema>;

const isVideoSymbol = Symbol.for("isVideo");
(videoSchema as any)[isVideoSymbol] = true;
(videoSchema._def as any)[isVideoSymbol] = true;

export function isVideo(schema: z.ZodTypeDef | z.ZodTypeDef) {
  return (schema as any)[isVideoSymbol];
}

export const assetSchema = z.object({
  key: z.string(),
  url: z.string(),
});

export type AssetType = z.infer<typeof assetSchema>;

const isAssetSymbol = Symbol.for("isAsset");
(assetSchema as any)[isAssetSymbol] = true;
(assetSchema._def as any)[isAssetSymbol] = true;

export function isAsset(schema: z.ZodTypeDef | z.ZodTypeDef) {
  return (schema as any)[isAssetSymbol];
}

export const richTextSchema = z.object({
  richText: z.string(),
});

const isRichTextSymbol = Symbol.for("isRichText");
(richTextSchema as any)[isRichTextSymbol] = true;
(richTextSchema._def as any)[isRichTextSymbol] = true;

export function isRichText(schema: z.ZodType<any> | z.ZodTypeDef) {
  return (schema as any)[isRichTextSymbol];
}

export const markdownSchema = z.object({
  markdown: z.string(),
});

const isMarkdownSymbol = Symbol.for("isMarkdown");
(markdownSchema as any)[isMarkdownSymbol] = true;
(markdownSchema._def as any)[isMarkdownSymbol] = true;

export function isMarkdown(schema: z.ZodType<any> | z.ZodTypeDef) {
  return (schema as any)[isMarkdownSymbol];
}
