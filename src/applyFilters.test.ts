import { describe, expect, it } from "vitest";
import { doesMatchFilter } from "./applyFilters";
import { Where } from "./filters";

describe("doesMatchFilter", () => {
  // Test data
  type TestType = {
    name: string;
    age: number;
    tags: string[];
    nested: {
      value: string;
    };
  };

  const testEntry: TestType = {
    name: "John Doe",
    age: 30,
    tags: ["developer", "typescript"],
    nested: {
      value: "test",
    },
  };

  it("should match empty filter", () => {
    const where: Where<TestType> = {};
    expect(doesMatchFilter(testEntry, where)).toBe(true);
  });

  // Basic comparison operators
  it("should match direct value comparison", () => {
    const where: Where<TestType> = { name: "John Doe" };
    expect(doesMatchFilter(testEntry, where)).toBe(true);
  });

  it("should handle $eq operator", () => {
    const where: Where<TestType> = { age: { $eq: 30 } };
    expect(doesMatchFilter(testEntry, where)).toBe(true);
  });

  it("should handle $ne operator", () => {
    const where: Where<TestType> = { age: { $ne: 25 } };
    expect(doesMatchFilter(testEntry, where)).toBe(true);
  });

  it("should handle numeric comparison operators", () => {
    expect(doesMatchFilter(testEntry, { age: { $gt: 25 } })).toBe(true);
    expect(doesMatchFilter(testEntry, { age: { $gte: 30 } })).toBe(true);
    expect(doesMatchFilter(testEntry, { age: { $lt: 35 } })).toBe(true);
    expect(doesMatchFilter(testEntry, { age: { $lte: 30 } })).toBe(true);
  });

  // Array operators
  it("should handle $in operator", () => {
    const where: Where<TestType> = { tags: { $in: ["developer"] } };
    expect(doesMatchFilter(testEntry, where)).toBe(true);
  });

  it("should handle $nin operator", () => {
    const where: Where<TestType> = { tags: { $nin: ["designer"] } };
    expect(doesMatchFilter(testEntry, where)).toBe(true);
  });

  it("should handle $all operator", () => {
    const where: Where<TestType> = { tags: { $all: ["developer", "typescript"] } };
    expect(doesMatchFilter(testEntry, where)).toBe(true);
  });

  // Logical operators
  it("should handle $and operator", () => {
    const where: Where<TestType> = {
      $and: [{ name: "John Doe" }, { age: { $gte: 30 } }],
    };
    expect(doesMatchFilter(testEntry, where)).toBe(true);
  });

  it("should handle $or operator", () => {
    const where: Where<TestType> = {
      $or: [{ age: 25 }, { name: "John Doe" }],
    };
    expect(doesMatchFilter(testEntry, where)).toBe(true);
  });

  it("should handle $nor operator", () => {
    const where: Where<TestType> = {
      $nor: [{ age: 25 }, { name: "Jane Doe" }],
    };
    expect(doesMatchFilter(testEntry, where)).toBe(true);
  });

  // Special operators
  it("should handle $exists operator", () => {
    expect(doesMatchFilter(testEntry, { name: { $exists: true } })).toBe(true);
    // @ts-expect-error
    expect(doesMatchFilter(testEntry, { missing: { $exists: false } })).toBe(
      true
    );
  });

  it("should handle $regex operator", () => {
    const where: Where<TestType> = { name: { $regex: "^John", $options: "" } };
    expect(doesMatchFilter(testEntry, where)).toBe(true);
  });

  it("should handle $not operator", () => {
    expect(doesMatchFilter(testEntry, { name: { $not: "Jane Doe" } })).toBe(true);
    expect(
      doesMatchFilter(testEntry, { age: { $not: { $lt: 30 } } })
    ).toBe(true);
  });

  // Text search
  it("should handle $text search", () => {
    const where: Where<TestType> = {
      $text: { $search: "John", $caseSensitive: false },
    };
    expect(doesMatchFilter(testEntry, where)).toBe(true);
  });

  it("should handle case-sensitive $text search", () => {
    const where: Where<TestType> = {
      $text: { $search: "JOHN", $caseSensitive: true },
    };
    expect(doesMatchFilter(testEntry, where)).toBe(false);
  });

  it("should handle diacritic-sensitive $text search", () => {
    const specialEntry = { ...testEntry, name: "Jöhn Döe" };
    const where: Where<TestType> = {
      $text: { $search: "John", $diacriticSensitive: false },
    };
    expect(doesMatchFilter(specialEntry, where)).toBe(true);
  });

  // Nested objects
  it("should handle nested object filtering", () => {
    const where: Where<TestType> = { nested: { value: "test" } };
    expect(doesMatchFilter(testEntry, where)).toBe(true);
  });

  it("should handle nested object with operators", () => {
    const where: Where<TestType> = {
      nested: { value: { $regex: "^te" } },
    };
    expect(doesMatchFilter(testEntry, where)).toBe(true);
  });
});
