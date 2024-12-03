import { JSONSchemaType } from "ajv";

export const getDefaultValue = (schema: JSONSchemaType<any>) => {
  switch (schema.type) {
    case "string":
      if (schema.format === "uuid") {
        return crypto.randomUUID();
      }
      return "";
    case "number":
    case "integer":
      return 0;
    case "boolean":
      return false;
    case "array":
      return [];
    case "object":
      if (!schema.properties) return {};
      const defaultValues: Record<string, any> = {};
      Object.entries(schema.properties).forEach(([key, value]) => {
        defaultValues[key] = getDefaultValue(value as JSONSchemaType<any>);
      });
      return defaultValues;
    default:
      return undefined;
  }
};
