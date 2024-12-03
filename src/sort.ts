import { z } from "zod";

export type SortDirection = "asc" | "desc";
export type Sort<T> = Array<[keyof T, SortDirection]>;

export const sortSchema = z.array(
  z.tuple([z.string(), z.enum(["asc", "desc"])])
);
