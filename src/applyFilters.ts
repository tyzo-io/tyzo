import { Where } from "./filters.js";

export function doesMatchFilter<T>(entry: T, where: Where<T>): boolean {
  // Handle logical operators first
  if ("$and" in where && where.$and) {
    return where.$and.every((condition) => doesMatchFilter(entry, condition));
  }
  if ("$or" in where && where.$or) {
    return where.$or.some((condition) => doesMatchFilter(entry, condition));
  }
  if ("$nor" in where && where.$nor) {
    return !where.$nor.some((condition) => doesMatchFilter(entry, condition));
  }
  if ("$text" in where && where.$text) {
    const searchTerm = where.$text.$search;
    const caseSensitive = where.$text.$caseSensitive ?? false;
    const diacriticSensitive = where.$text.$diacriticSensitive ?? false;

    // Function to normalize text based on search options
    const normalizeText = (text: string) => {
      let normalized = text;
      if (!caseSensitive) {
        normalized = normalized.toLowerCase();
      }
      if (!diacriticSensitive) {
        normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      }
      return normalized;
    };

    // Function to check if a value contains the search term
    const containsSearchTerm = (value: any): boolean => {
      if (typeof value === "string") {
        const normalizedValue = normalizeText(value);
        const normalizedPattern = normalizeText(searchTerm);
        return normalizedValue.includes(normalizedPattern);
      }
      if (Array.isArray(value)) {
        return value.some(v => containsSearchTerm(v));
      }
      if (value && typeof value === "object") {
        return Object.values(value).some(v => containsSearchTerm(v));
      }
      return false;
    };

    return containsSearchTerm(entry);
  }

  // Check each field in the where clause
  return Object.entries(where).every(([key, condition]) => {
    console.log(key,entry[key as keyof T], condition)
    if (key.startsWith("$")) return true; // Skip logical operators we already handled

    const value = entry[key as keyof T];

    // Handle direct value comparison
    if (!(condition instanceof Object) || condition === null) {
      return value === condition;
    }

    // Handle comparison operators
    const comp = condition as any;

    if ("$eq" in comp) return value === comp.$eq;
    if ("$ne" in comp) return value !== comp.$ne;
    if ("$gt" in comp) return value > comp.$gt;
    if ("$gte" in comp) return value >= comp.$gte;
    if ("$lt" in comp) return value < comp.$lt;
    if ("$lte" in comp) return value <= comp.$lte;
    if ("$in" in comp) {
      if (Array.isArray(value)) {
        return Array.isArray(comp.$in) && value.some(v => comp.$in.includes(v));
      }
      return Array.isArray(comp.$in) && comp.$in.includes(value);
    }
    if ("$nin" in comp)
      return Array.isArray(comp.$nin) && !comp.$nin.includes(value);
    console.log(comp, value)
    if ("$exists" in comp)
      return comp.$exists ? value !== undefined : value === undefined;

    if ("$regex" in comp) {
      if (typeof value !== "string") return false;
      const flags = comp.$options || "";
      const regex = new RegExp(comp.$regex, flags);
      return regex.test(value);
    }

    if ("$all" in comp && Array.isArray(value)) {
      return (
        Array.isArray(comp.$all) &&
        comp.$all.every((item: any) => value.includes(item))
      );
    }

    if ("$not" in comp) {
      if (typeof comp.$not === "string") {
        return value !== comp.$not;
      }
      return !doesMatchFilter({ value } as any, { value: comp.$not } as any);
    }

    // Recursively handle nested objects
    return doesMatchFilter(value as any, condition as any);
  });
}
