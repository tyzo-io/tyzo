import {
  isAssetJsonSchema,
  isImageJsonSchema,
  isMarkdownJsonSchema,
  isRichTextJsonSchema,
  isVideoJsonSchema,
} from "../schemas.js";
import { JSONSchemaType } from "ajv";

const localApiUrl = "http://localhost:3456/api";

export function convertLocalUrlsToRemote<T>({
  entry,
  remoteBaseUrl,
  schema,
}: {
  entry: T;
  remoteBaseUrl: string;
  schema: JSONSchemaType<any>;
}): T {
  if (!schema || !entry) return entry;

  // Helper to convert a local URL to remote URL
  function convertUrl(url: string): string {
    while (url.includes(localApiUrl)) {
      url = url.replace(localApiUrl, remoteBaseUrl);
    }
    return url;
  }

  // Helper to process an object based on its schema
  function processValue(value: any, schema: JSONSchemaType<any>): any {
    if (!value) return value;

    // Handle arrays
    if (schema.type === "array") {
      return value.map((item: any) => processValue(item, schema.items));
    }

    // Handle asset types
    if (isImageJsonSchema(schema)) {
      if (typeof value === "object" && value.src) {
        return {
          ...value,
          src: convertUrl(value.src),
          srcset: value.srcset ? convertUrl(value.srcset) : value.srcset,
        };
      }
      return value;
    }
    if (isVideoJsonSchema(schema)) {
      if (typeof value === "object" && value.src) {
        return {
          ...value,
          src: convertUrl(value.src),
        };
      }
      return value;
    }
    if (isAssetJsonSchema(schema)) {
      if (typeof value === "object" && value.url) {
        return {
          ...value,
          url: convertUrl(value.url),
        };
      }
      return value;
    }

    if (isRichTextJsonSchema(schema)) {
      if (typeof value?.richText === "string") {
        return { richText: convertUrl(value.richText) };
      }
    }

    if (isMarkdownJsonSchema(schema)) {
      if (typeof value?.markdown === "string") {
        return { markdown: convertUrl(value.markdown) };
      }
    }

    // Handle objects
    if (schema.type === "object") {
      const result: any = {};

      for (const key in value) {
        if (key in (schema.properties ?? {})) {
          result[key] = processValue(value[key], schema.properties[key]);
        } else {
          result[key] = value[key];
        }
      }
      return result;
    }

    return value;
  }

  return processValue(entry, schema);
}

export function convertRemoteUrlsToLocal<T>({
  entry,
  remoteBaseUrl,
  schema,
}: {
  entry: T;
  remoteBaseUrl: string;
  schema: JSONSchemaType<any>;
}): T {
  if (!schema || !entry) return entry;

  // Helper to convert a remote URL to local URL
  function convertUrl(url: string): string {
    while (url.includes(remoteBaseUrl)) {
      url = url.replace(remoteBaseUrl, localApiUrl);
    }
    return url;
  }

  // Helper to process an object based on its schema
  function processValue(value: any, schema: JSONSchemaType<any>): any {
    if (!value) return value;

    // Handle arrays
    if (schema.type === "array") {
      return value.map((item: any) => processValue(item, schema.items));
    }

    // Handle asset types
    if (isImageJsonSchema(schema)) {
      if (typeof value === "object" && value.src) {
        return {
          ...value,
          src: convertUrl(value.src),
          srcset: value.srcset ? convertUrl(value.srcset) : value.srcset,
        };
      }
      return value;
    }
    if (isVideoJsonSchema(schema)) {
      if (typeof value === "object" && value.src) {
        return {
          ...value,
          src: convertUrl(value.src),
        };
      }
      return value;
    }
    if (isAssetJsonSchema(schema)) {
      if (typeof value === "object" && value.url) {
        return {
          ...value,
          url: convertUrl(value.url),
        };
      }
      return value;
    }

    if (isRichTextJsonSchema(schema)) {
      if (typeof value?.richText === "string") {
        return { richText: convertUrl(value.richText) };
      }
    }

    if (isMarkdownJsonSchema(schema)) {
      if (typeof value?.markdown === "string") {
        return { markdown: convertUrl(value.markdown) };
      }
    }

    // Handle objects
    if (schema.type === "object") {
      const result: any = {};

      for (const key in value) {
        if (key in (schema.properties ?? {})) {
          result[key] = processValue(value[key], schema.properties[key]);
        } else {
          result[key] = value[key];
        }
      }
      return result;
    }

    return value;
  }

  return processValue(entry, schema);
}
