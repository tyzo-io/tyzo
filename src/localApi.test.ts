import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { LocalApi } from "./localApi";
import { defineCollection, defineGlobal } from "./content";
import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

async function createTempDir() {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "tyzo-test-"));
  return tempDir;
}

async function removeTempDir(dir: string) {
  await fs.rm(dir, { recursive: true, force: true });
}

describe("LocalApi", () => {
  let api: LocalApi;
  let tempDir: string;

  const posts = defineCollection({
    name: "posts",
    idField: "slug",
    schema: z.object({
      slug: z.string(),
      title: z.string(),
      content: z.string(),
    }),
  });

  const settings = defineGlobal({
    name: "settings",
    schema: z.object({
      siteName: z.string(),
      description: z.string(),
    }),
  });

  beforeEach(async () => {
    tempDir = await createTempDir();
    api = new LocalApi({
      contentDir: tempDir,
      collections: [posts],
      globals: [settings],
    });
  });

  afterEach(async () => {
    await removeTempDir(tempDir);
  });

  describe("Collections", () => {
    it("should create and retrieve an entry", async () => {
      const entry = {
        slug: "hello-world",
        title: "Hello World",
        content: "First post",
      };

      await api.setEntry(posts, entry.slug, entry);
      const retrieved = await api.getEntry(posts, "hello-world");

      expect(retrieved).toEqual(entry);
    });

    it("should return null for non-existent entry", async () => {
      const retrieved = await api.getEntry(posts, "non-existent");
      expect(retrieved).toBeNull();
    });

    it("should get all entries", async () => {
      const entries = [
        {
          slug: "test-1",
          title: "Test 1",
          content: "Content 1",
        },
        {
          slug: "test-2",
          title: "Test 2",
          content: "Content 2",
        },
      ];

      await Promise.all(
        entries.map((entry) => api.setEntry(posts, entry.slug, entry))
      );

      const retrieved = await api.getEntries(posts);
      expect(retrieved).toHaveLength(2);
      expect(retrieved).toEqual(expect.arrayContaining(entries));
    });

    it("should delete an entry", async () => {
      await api.setEntry(posts, "delete-me", {
        slug: "delete-me",
        title: "Delete Me",
        content: "Soon to be deleted",
      });

      const deleted = await api.deleteEntry(posts, "delete-me");
      expect(deleted).toBe(true);

      const retrieved = await api.getEntry(posts, "delete-me");
      expect(retrieved).toBeNull();
    });

    it("should validate data against schema", async () => {
      const invalidEntry = {
        title: "Invalid",
        // missing content field
      };

      await expect(
        api.setEntry(posts, "x", invalidEntry as any)
      ).rejects.toThrow();
    });
  });

  describe("Globals", () => {
    it("should create and retrieve a global", async () => {
      const data = {
        siteName: "My Blog",
        description: "A test blog",
      };

      await api.setGlobalValue(settings, data);
      const retrieved = await api.getGlobalValue(settings);

      expect(retrieved).toEqual(data);
    });

    it("should return null for non-existent global", async () => {
      const retrieved = await api.getGlobalValue(settings);
      expect(retrieved).toBeNull();
    });

    it("should get all globals", async () => {
      const data = {
        siteName: "Test Blog",
        description: "A test blog",
      };

      await api.setGlobalValue(settings, data);

      const globals = await api.getGlobalValues();
      expect(globals).toHaveLength(1);
      expect(globals[0]).toEqual(data);
    });

    it("should validate data against schema", async () => {
      const invalidData = {
        siteName: "Invalid",
        // missing description field
      };

      await expect(
        api.setGlobalValue(settings, invalidData as any)
      ).rejects.toThrow();
    });
  });

  describe("Assets", () => {
    it("should upload and retrieve an asset", async () => {
      const imageData = Buffer.from("fake-image-data");
      const uploaded = await api.uploadAsset(imageData, {
        filename: "test.jpg",
      });

      expect(uploaded.filename).toBe("test.jpg");
      expect(uploaded.contentType).toBe("image/jpeg");
      expect(uploaded.size).toBe(imageData.length);

      const retrieved = await api.getAsset("test.jpg");
      expect(retrieved).not.toBeNull();
      expect(retrieved!.data).toEqual(imageData);
      expect(retrieved!.contentType).toBe("image/jpeg");
      // expect(retrieved!.size).toBe(imageData.length);
    });

    it("should handle duplicate filenames", async () => {
      const file1 = Buffer.from("data1");
      const file2 = Buffer.from("data2");

      const upload1 = await api.uploadAsset(file1, { filename: "test.jpg" });
      const upload2 = await api.uploadAsset(file2, { filename: "test.jpg" });

      expect(upload1.filename).toBe("test.jpg");
      expect(upload2.filename).toBe("test-1.jpg");

      const retrieved1 = await api.getAsset("test.jpg");
      const retrieved2 = await api.getAsset("test-1.jpg");

      expect(retrieved1!.data).toEqual(file1);
      expect(retrieved2!.data).toEqual(file2);
    });

    it("should list all assets", async () => {
      const files = [
        { name: "image1.jpg", data: Buffer.from("image1") },
        { name: "image2.png", data: Buffer.from("image2") },
        { name: "doc.pdf", data: Buffer.from("document") },
      ];

      await Promise.all(
        files.map((file) => api.uploadAsset(file.data, { filename: file.name }))
      );

      const assets = await api.listAssets();
      expect(assets).toHaveLength(3);
      expect(assets).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            filename: "image1.jpg",
            contentType: "image/jpeg",
          }),
          expect.objectContaining({
            filename: "image2.png",
            contentType: "image/png",
          }),
          expect.objectContaining({
            filename: "doc.pdf",
            contentType: "application/pdf",
          }),
        ])
      );
    });

    it("should delete an asset", async () => {
      const imageData = Buffer.from("test-image");
      await api.uploadAsset(imageData, { filename: "delete-me.jpg" });

      const deleted = await api.deleteAsset("delete-me.jpg");
      expect(deleted).toBe(true);

      const retrieved = await api.getAsset("delete-me.jpg");
      expect(retrieved).toBeNull();
    });

    it("should handle missing assets gracefully", async () => {
      const asset = await api.getAsset("non-existent.jpg");
      expect(asset).toBeNull();

      const deleted = await api.deleteAsset("non-existent.jpg");
      expect(deleted).toBe(false);
    });

    it("should detect content types correctly", async () => {
      const files = [
        { name: "image.jpg", type: "image/jpeg" },
        { name: "image.png", type: "image/png" },
        { name: "video.mp4", type: "video/mp4" },
        { name: "doc.pdf", type: "application/pdf" },
      ];

      await Promise.all(
        files.map((file) =>
          api.uploadAsset(Buffer.from("test"), { filename: file.name })
        )
      );

      for (const file of files) {
        const asset = await api.getAsset(file.name);
        expect(asset?.contentType).toBe(file.type);
      }
    });
  });

  describe("File System", () => {
    it("should create collection directory structure", async () => {
      await api.setEntry(posts, "test", {
        slug: "test",
        title: "Test",
        content: "Content",
      });

      const collectionDir = path.join(tempDir, "posts");
      const exists = await fs
        .stat(collectionDir)
        .then((stat) => stat.isDirectory())
        .catch(() => false);

      expect(exists).toBe(true);
    });

    it("should create globals directory structure", async () => {
      await api.setGlobalValue(settings, {
        siteName: "Test",
        description: "Test Description",
      });

      const globalsDir = path.join(tempDir, "globals");
      const exists = await fs
        .stat(globalsDir)
        .then((stat) => stat.isDirectory())
        .catch(() => false);

      expect(exists).toBe(true);
    });

    it("should store files with correct names", async () => {
      const slug = "test-post";
      await api.setEntry(posts, slug, {
        slug,
        title: "Test",
        content: "Content",
      });

      const filePath = path.join(tempDir, "posts", `${slug}.json`);
      const exists = await fs
        .stat(filePath)
        .then((stat) => stat.isFile())
        .catch(() => false);

      expect(exists).toBe(true);
    });
  });
});
