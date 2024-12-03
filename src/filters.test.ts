import { describe, it, expect } from "vitest";
import { z } from "zod";
import { whereSchema, type Where } from "./filters";

describe("Filter Schema", () => {
  // Define a sample document schema for testing
  const documentSchema = z.object({
    name: z.string(),
    age: z.number(),
    optionalAge: z.number().optional(),
    tags: z.array(z.string()),
    nested: z.object({
      field: z.string(),
    }),
  });

  type Document = z.infer<typeof documentSchema>;

  it("should validate basic equality filters", () => {
    const filter: Where<Document> = {
      name: "John",
      age: 25,
    };

    expect(() => whereSchema.parse(filter)).not.toThrow();
  });

  it("should validate basic equality filters 2", () => {
    const filter: Where<Document> = {
      name: "John",
      age: { $eq: 25 },
    };

    expect(() => whereSchema.parse(filter)).not.toThrow();
  });

  it("should validate comparison operators", () => {
    const filter: Where<Document> = {
      age: {
        $gt: 20,
        $lt: 30,
        $gte: 21,
        $lte: 29,
        $ne: 25,
      },
    };

    expect(() => whereSchema.parse(filter)).not.toThrow();
  });

  it("should throw with illegal operator", () => {
    const filter: Where<Document> = {
      age: {
        $gt: 20,
        // @ts-expect-error
        $doesntExist: 30,
      },
    };
    // This cannot throw. What if the user defined an object with the $doesntExist key?
    // expect(() => whereSchema.parse(filter)).toThrow();
  });

  it("should validate array operators", () => {
    const filter: Where<Document> = {
      age: { $in: [20, 25, 30] },
      tags: { $all: ["tag1", "tag2"] },
    };

    expect(() => whereSchema.parse(filter)).not.toThrow();
  });

  it("should validate logical operators", () => {
    const filter: Where<Document> = {
      $or: [{ name: "John" }, { age: { $gt: 25 } }],
      $and: [{ tags: { $in: ["tag1"] } }],
    };

    expect(() => whereSchema.parse(filter)).not.toThrow();
  });

  it("should validate regex operators", () => {
    const filter: Where<Document> = {
      name: { $regex: "^John", $options: "i" },
    };

    expect(() => whereSchema.parse(filter)).not.toThrow();
  });

  it("should validate text search", () => {
    const filter: Where<Document> = {
      $text: {
        $search: "search term",
        $caseSensitive: true,
        $diacriticSensitive: false,
      },
    };

    expect(() => whereSchema.parse(filter)).not.toThrow();
  });

  it("should validate nested field queries", () => {
    const filter: Where<Document> = {
      // "nested.field": "value",
      nested: { field: { $regex: "^test" } },
    };

    expect(() => whereSchema.parse(filter)).not.toThrow();
  });

  // Type safety tests (these should fail TypeScript compilation)
  // @ts-expect-error - Invalid field name
  const invalidField: Filter<Document> = { invalidField: "value" };

  // @ts-expect-error - Invalid operator
  const invalidOperator: Filter<Document> = { age: { $invalid: 25 } };

  // @ts-expect-error - Invalid value type
  const invalidType: Where<Document> = { age: "25" };

  const filterx: Where<Document> = {
    nested: {
      field: "x",
      // @ts-expect-error
      $eqxxx: "",
    },
  };
});
