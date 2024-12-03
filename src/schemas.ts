import { ignoreOverride, zodToJsonSchema } from "zod-to-json-schema";
import { Collection, Global, Id } from "./types";
import { assetSchema, imageSchema, videoSchema, z } from "./content";

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
  return zodToJsonSchema(schema, {
    definitions: {
      imageSchema,
      videoSchema,
      assetSchema,
      ...allCollections,
    },
    override(def, refs, seen, forceResolution) {
      if (def === schema) {
        return undefined;
      }
      if ("typeName" in def && def.typeName === "ZodLazy" && "getter" in def) {
        const otherType = (def.getter as () => z.ZodType<any>)();
        if (otherType === schema) {
          return undefined;
        }
        const otherCollection = Object.keys(allCollections ?? {}).find(
          (key) => allCollections![key] === otherType
        );

        return {
          type: "object",
          format: `#/ref/collections/${otherCollection}`,
          properties: {
            id: { type: "string" },
            collection: { type: "string" },
          },
          required: ["id", "collection"],
        };
      }
      return ignoreOverride;
    },
    // override(def, refs, seen, forceResolution) {
    //   if ("typeName" in def && def.typeName === "ZodLazy") {
    //     console.log(def);
    //     console.log(def.getter())
    //     return {
    //       type: "integer",
    //     };
    //   }
    //   return ignoreOverride;
    // },
  });
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
