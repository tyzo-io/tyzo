import { z } from "zod";

export type Comparators<T> = {
  $eq?: T;
  $gt?: T;
  $gte?: T;
  $lt?: T;
  $lte?: T;
  $ne?: T;
  $in?: T extends ReadonlyArray<infer U> ? ReadonlyArray<U> : ReadonlyArray<T>;
  $nin?: T extends ReadonlyArray<infer U> ? ReadonlyArray<U> : ReadonlyArray<T>;
  $all?: T extends ReadonlyArray<infer U> ? ReadonlyArray<U> : ReadonlyArray<T>;
  $not?: T extends string ? Comparators<T> | string : Comparators<T>;
  $exists?: boolean;
  $regex?: T extends string ? string : never;
  $options?: T extends string ? string : never;
};

export type LogicalOperators<T> = {
  $and?: Where<T>[];
  $or?: Where<T>[];
  $nor?: Where<T>[];
  $text?: {
    $search: string;
    // $language?: string;
    $caseSensitive?: boolean;
    $diacriticSensitive?: boolean;
  };
};

export type Where<T> = {
  [key in keyof T]?: T[key] extends string | number
    ? T[key] | Comparators<T[key]>
    : Where<T[key]> | Comparators<T[key]>;
} & LogicalOperators<T>;

export const whereSchema: z.ZodType = z.union([
  z.record(
    z.string(),
    z.union([
      z.string(),
      z.number(),
      z.lazy(() => whereSchema),
      z
        .object({
          $eq: z.union([z.string(), z.number()]).optional(),
          $gt: z.union([z.string(), z.number()]).optional(),
          $gte: z.union([z.string(), z.number()]).optional(),
          $lt: z.union([z.string(), z.number()]).optional(),
          $lte: z.union([z.string(), z.number()]).optional(),
          $ne: z.union([z.string(), z.number()]).optional(),
          $in: z.array(z.union([z.string(), z.number()])).optional(),
          $nin: z.array(z.union([z.string(), z.number()])).optional(),
          $all: z.array(z.union([z.string(), z.number()])).optional(),
          $not: z.union([z.string(), z.number()]).optional(),
          $exists: z.boolean().optional(),
          $regex: z.string().optional(),
          $options: z.string().optional(),
        })
        .strict(),
    ])
  ),
  z
    .object({
      $and: z.array(z.lazy(() => whereSchema)).optional(),
      $or: z.array(z.lazy(() => whereSchema)).optional(),
      $nor: z.array(z.lazy(() => whereSchema)).optional(),
      $text: z
        .object({
          $search: z.string(),
          $language: z.string().optional(),
          $caseSensitive: z.boolean().optional(),
          $diacriticSensitive: z.boolean().optional(),
        })
        .optional(),
    })
    .strict(),
]);
