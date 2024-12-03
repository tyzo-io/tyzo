import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";
import {
  Asset,
  Collection,
  CollectionReference,
  Global,
  GlobalReference,
  Id,
} from "./types";
import { doesMatchFilter } from "./applyFilters";
import type { Sharp } from "sharp";
import { convertZodSchema } from "./schemas";
import Ajv from "ajv";
import { ajvFormats } from "./validate";

// type SavedEntry<T> = {
//   data: T;
//   dataOnRemote?: T;
// };

// type SavedGlobal<T> = {
//   data: T;
//   dataOnRemote?: T;
// };

// type CreateEntryJournalItem<T> = {
//   id: string;
//   data: T;
//   collection: string;
// };

// type UpdateEntryJournalItem<T> = {
//   id: string;
//   data: T;
//   collection: string;
//   field: string;
//   value: any;
// };

// type DeleteEntryJournalItem = {
//   id: string;
//   collection: string;
// };

// type CreateGlobalJournalItem<T> = {
//   global: string;
//   data: T;
// };

// type UpdateGlobalJournalItem<T> = {
//   data: T;
//   global: string;
//   field: string;
//   value: any;
// };

// type DeleteGlobalJournalItem = {
//   global: string;
// };

export class LocalApi {
  private collections: Map<string, Collection<any>>;
  private globals: Map<string, Global<any>>;
  private contentDir: string;

  constructor(options: {
    collections?: Collection<any>[];
    globals?: Global<any>[];
    contentDir: string;
  }) {
    this.collections = new Map(
      (options.collections || []).map((c) => [c.name, c])
    );
    this.globals = new Map((options.globals || []).map((g) => [g.name, g]));
    this.contentDir = options.contentDir;
  }

  private getCollectionRef<T>(ref: CollectionReference<T>): Collection<T> {
    if (typeof ref === "string") {
      const collection = this.collections.get(ref);
      if (!collection) {
        throw new Error(`Collection ${ref} not found`);
      }
      return collection as Collection<T>;
    }
    return ref;
  }

  private getGlobalRef<T>(ref: GlobalReference<T>): Global<T> {
    if (typeof ref === "string") {
      const global = this.globals.get(ref);
      if (!global) {
        throw new Error(`Global ${ref} not found`);
      }
      return global as Global<T>;
    }
    return ref;
  }

  async getEntry<T>(
    collection: CollectionReference<T>,
    id: Id
  ): Promise<T | null> {
    const col = this.getCollectionRef(collection);
    try {
      const filePath = path.join(this.contentDir, col.name, `${id}.json`);
      const content = await fs.readFile(filePath, "utf-8");
      const data = JSON.parse(content) as { data: T };
      return data.data;
    } catch {
      return null;
    }
  }

  async getCollections(): Promise<Collection<any>[]> {
    const collections = await this._getCollections();
    return collections;
  }

  async getCollection<T>(
    ref: CollectionReference<T>
  ): Promise<Collection<T> | null> {
    const collection = await this.getCollectionRef(ref);
    return collection;
  }

  async getEntries<T>(
    collection: CollectionReference<T>,
    options?: {
      includeCount?: boolean;
      limit?: number;
      offset?: number;
      filters?: Record<string, any>;
      sort?: [keyof T, "asc" | "desc"][];
    }
  ): Promise<{ entries: T[]; limit: number; offset: number; count?: number }> {
    const limit = options?.limit ?? 1000;
    const col = this.getCollectionRef(collection);
    const dir = path.join(this.contentDir, col.name);
    try {
      await fs.access(dir);
    } catch {
      return { entries: [], limit, offset: options?.offset ?? 0 };
    }

    let files = await fs.readdir(dir);

    let entries: T[] = await Promise.all(
      files
        .filter((file) => file.endsWith(".json"))
        .map(async (file) => {
          const content = await fs.readFile(path.join(dir, file), "utf-8");
          const data = JSON.parse(content) as { data: T };
          return data.data;
        })
    );
    if (options?.filters) {
      entries = entries.filter((entry) =>
        doesMatchFilter(entry, options.filters!)
      );
    }
    const totalCount = entries.length;
    if (options?.offset) {
      entries = entries.slice(options.offset);
    }
    entries = entries.slice(0, limit);
    for (const sort of options?.sort ?? []) {
      entries.sort((a: any, b: any) => {
        const [key, direction] = sort;
        const valueA = a[key];
        const valueB = b[key];
        return direction === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      });
    }

    return {
      entries,
      limit,
      offset: options?.offset ?? 0,
      count: options?.includeCount ? totalCount : undefined,
    };
  }

  async setEntry<T>(
    collection: CollectionReference<T>,
    id: Id,
    data: T
  ): Promise<void> {
    const col = this.getCollectionRef(collection);
    const dir = path.join(this.contentDir, col.name);
    await fs.mkdir(dir, { recursive: true });
    const collections = await this._getCollections();

    const schema = convertZodSchema(
      col.schema,
      collections.reduce((acc, col) => {
        acc[col.name] = col.schema;
        return acc;
      }, {} as Record<string, z.ZodType<any>>)
    );
    const ajv = new Ajv({
      formats: ajvFormats(collections.map((col) => col.name)),
    });
    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (!valid) throw new Error(ajv.errorsText(validate.errors));
    // const parsed = col.schema.parse(data);
    await fs.writeFile(
      path.join(dir, `${id}.json`),
      JSON.stringify({ data }, null, 2)
    );
  }

  async deleteEntry<T>(
    collection: CollectionReference<T>,
    id: Id
  ): Promise<boolean> {
    const col = this.getCollectionRef(collection);
    const filePath = path.join(this.contentDir, col.name, `${id}.json`);
    try {
      await fs.unlink(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async getGlobals(): Promise<Global<any>[]> {
    const globals = await this._getGlobals();
    return globals;
  }

  async getGlobal(ref: GlobalReference<any>): Promise<Global<any> | null> {
    const glob = this.getGlobalRef(ref);
    return glob;
  }

  async getGlobalValues(): Promise<any[]> {
    const globs = await this._getGlobals();
    return await Promise.all(globs.map((glob) => this._getGlobalValue(glob)));
  }

  async getGlobalValue<T>(ref: GlobalReference<T>): Promise<T | null> {
    const global = await this.getGlobalRef(ref);
    return this._getGlobalValue(global);
  }

  async setGlobalValue<T>(global: GlobalReference<T>, data: T): Promise<void> {
    const glob = this.getGlobalRef(global);
    const dir = path.join(this.contentDir, "globals");
    await fs.mkdir(dir, { recursive: true });

    const parsed = glob.schema.parse(data);
    await fs.writeFile(
      path.join(dir, `${glob.name}.json`),
      JSON.stringify({ data: parsed }, null, 2)
    );
  }

  // Asset Management
  private getAssetDir() {
    return path.join(this.contentDir, "assets");
  }

  private async ensureAssetDir() {
    const dir = this.getAssetDir();
    await fs.mkdir(dir, { recursive: true });
    return dir;
  }

  private getAssetPath(filename: string) {
    return path.join(this.getAssetDir(), filename);
  }

  async uploadAsset(
    file: Buffer | Uint8Array,
    options: {
      filename: string;
      contentType?: string;
    }
  ): Promise<{
    filename: string;
    path: string;
    size: number;
    contentType?: string;
  }> {
    const dir = await this.ensureAssetDir();
    const { filename } = options;
    // Use provided contentType or detect from filename
    const contentType = options.contentType ?? this.getContentType(filename);

    // Ensure unique filename
    let finalFilename = filename;
    let counter = 1;
    while (
      await fs
        .access(path.join(dir, finalFilename))
        .then(() => true)
        .catch(() => false)
    ) {
      const ext = path.extname(filename);
      const base = path.basename(filename, ext);
      finalFilename = `${base}-${counter}${ext}`;
      counter++;
    }

    const filePath = path.join(dir, finalFilename);
    await fs.writeFile(filePath, file);

    const stats = await fs.stat(filePath);
    return {
      filename: finalFilename,
      path: filePath,
      size: stats.size,
      contentType,
    };
  }

  async getAsset(
    filename: string,
    options?: {
      width?: number;
      height?: number;
      format?: "avif" | "webp" | "jpeg" | "png";
      quality?: number;
    }
  ): Promise<{ data: Buffer; contentType?: string } | null> {
    try {
      const filePath = this.getAssetPath(filename);
      let data = await fs.readFile(filePath);
      const stats = await fs.stat(filePath);
      const contentType = this.getContentType(filename);

      if (
        options?.width ||
        options?.height ||
        options?.format ||
        options?.quality
      ) {
        try {
          const sharp = require("sharp");
          let transform = sharp(data) as Sharp;

          if (options?.width || options?.height) {
            transform = transform.resize(options?.width, options?.height, {
              fit: "contain",
              withoutEnlargement: true,
            });
          }

          if (options.format) {
            transform = transform.toFormat(options.format, {
              quality: options.quality,
            });
          }

          data = await transform.toBuffer();
        } catch {
          console.warn(
            "Could not transform image. To use transformations locally, install sharp. Using the original file instead."
          );
        }
      }

      return { data, contentType };
    } catch {
      return null;
    }
  }

  async listAssets(): Promise<Asset[]> {
    const dir = this.getAssetDir();
    try {
      const files = await fs.readdir(dir);
      const assets = await Promise.all(
        files.map(async (filename) => {
          const filePath = path.join(dir, filename);
          const stats = await fs.stat(filePath);
          const contentType = this.getContentType(filename);
          return {
            name: filename.split("/").pop()!,
            key: filename,
            size: stats.size,
            httpMetadata: contentType
              ? {
                  contentType,
                }
              : undefined,
          };
        })
      );
      return assets;
    } catch {
      return [];
    }
  }

  async deleteAsset(filename: string): Promise<boolean> {
    try {
      const filePath = this.getAssetPath(filename);
      await fs.unlink(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private getContentType(filename: string): string | undefined {
    const ext = path.extname(filename).toLowerCase();
    const contentTypes: Record<string, string> = {
      // Images
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
      // Videos
      ".mp4": "video/mp4",
      ".webm": "video/webm",
      // Audio
      ".mp3": "audio/mpeg",
      ".wav": "audio/wav",
      ".ogg": "audio/ogg",
      // Documents
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      // Archives
      ".zip": "application/zip",
      ".rar": "application/x-rar-compressed",
      // Other
      ".json": "application/json",
      ".xml": "application/xml",
      ".txt": "text/plain",
    };
    return contentTypes[ext];
  }

  private async _getCollections(): Promise<Collection<any>[]> {
    return Array.from(this.collections.values());
  }

  private async _getGlobals(): Promise<Global<any>[]> {
    return Array.from(this.globals.values());
  }

  private async _getGlobalValue<T>(glob: Global<T>): Promise<T | null> {
    const filePath = path.join(this.contentDir, "globals", `${glob.name}.json`);
    try {
      const content = await fs.readFile(filePath, "utf-8");
      const data = JSON.parse(content) as { data: T };
      const parsed = glob.schema.parse(data.data);
      return parsed;
    } catch (err) {
      return null;
    }
  }
}
