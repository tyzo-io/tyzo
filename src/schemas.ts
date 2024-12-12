import { ignoreOverride, zodToJsonSchema } from "zod-to-json-schema";
import { Collection, Global, Id } from "./types";
import {
  assetSchema,
  imageSchema,
  isAsset,
  isEntryReference,
  isImage,
  isMarkdown,
  isRichText,
  isVideo,
  markdownSchema,
  richTextSchema,
  videoSchema,
  z,
} from "./content";

export interface SerializedCollection {
  name: string;
  idField: Id;
  schema: ReturnType<typeof zodToJsonSchema>;
}

export interface SerializedGlobal {
  name: string;
  schema: ReturnType<typeof zodToJsonSchema>;
}

export function convertZodSchema(
  schema: z.ZodType<any>,
  allCollections?: Record<string, z.ZodType>
) {
  let hasMarkdown = false
  let hasRichText = false
  let hasImage = false
  let hasVideo = false
  let hasAsset = false
  const jsonSchema = zodToJsonSchema(schema, {
    definitions: {
      imageSchema,
      videoSchema,
      assetSchema,
      markdownSchema,
      richTextSchema,
      // ...allCollections,
    },
    override(def, refs, seen, forceResolution) {
      if (def === schema) {
        return undefined;
      }
      if (isMarkdown(def)) {
        hasMarkdown = true
        return {
          type: "object",
          $ref: "#/definitions/markdownSchema",
        };
      }
      if (isRichText(def)) {
        hasRichText = true
        return {
          type: "object",
          $ref: "#/definitions/richTextSchema",
        };
      }
      if (isImage(def)) {
        hasImage = true;
        return {
          type: "object",
          $ref: "#/definitions/imageSchema",
        };
      }
      if (isVideo(def)) {
        hasVideo = true;
        return {
          type: "object",
          $ref: "#/definitions/videoSchema",
        };
      }
      if (isAsset(def)) {
        hasAsset = true;
        return {
          type: "object",
          $ref: "#/definitions/assetSchema",
        };
      }
      if (isEntryReference(def)) {
        const collection = (def as any).shape().collection._def.value;
        return {
          type: "object",
          $ref: `#/definitions/${collection}`,
          properties: {
            id: {
              type: "string",
            },
            collection: { type: "string", const: collection },
          },
          required: ["id", "collection"],
        };
      }
      return ignoreOverride;
    },
  });

  if (!jsonSchema.definitions) {
    jsonSchema.definitions = {};
  }
  if (hasImage) {
    jsonSchema.definitions.imageSchema = zodToJsonSchema(imageSchema);
  }
  if (hasVideo) {
    jsonSchema.definitions.videoSchema = zodToJsonSchema(videoSchema);
  }
  if (hasAsset) {
    jsonSchema.definitions.assetSchema = zodToJsonSchema(assetSchema);
  }
  if (hasMarkdown) {
    jsonSchema.definitions.markdownSchema = zodToJsonSchema(markdownSchema);
  }
  if (hasRichText) {
    jsonSchema.definitions.richTextSchema = zodToJsonSchema(richTextSchema);
  }

  for (const collectionKey of Object.keys(allCollections ?? {})) {
    jsonSchema.definitions[collectionKey] = {
      type: "object",
      properties: {
        id: {
          type: "string",
        },
        collection: { type: "string", const: collectionKey },
      },
      required: ["id", "collection"],
    };
  }

  return jsonSchema;
}

export function isImageJsonSchema(schema: any) {
  return (
    schema &&
    typeof schema === "object" &&
    schema.$ref === "#/definitions/imageSchema"
  );
}

export function isVideoJsonSchema(schema: any) {
  return (
    schema &&
    typeof schema === "object" &&
    schema.$ref === "#/definitions/videoSchema"
  );
}

export function isAssetJsonSchema(schema: any) {
  return (
    schema &&
    typeof schema === "object" &&
    schema.$ref === "#/definitions/assetSchema"
  );
}

export function isRichTextJsonSchema(schema: any) {
  return (
    schema &&
    typeof schema === "object" &&
    schema.$ref === "#/definitions/richTextSchema"
  );
}

export function isMarkdownJsonSchema(schema: any) {
  return (
    schema &&
    typeof schema === "object" &&
    schema.$ref === "#/definitions/markdownSchema"
  );
}

export function serializeCollection(
  collection: Collection<any>,
  allCollections?: Record<string, z.ZodType>
): SerializedCollection {
  return {
    name: collection.name,
    idField: collection.idField as Id,
    schema: convertZodSchema(collection.schema, allCollections),
  };
}

export function serializeGlobal(
  global: Global<any>,
  allCollections?: Record<string, z.ZodType>
): SerializedGlobal {
  return {
    name: global.name,
    schema: convertZodSchema(global.schema, allCollections),
  };
}
