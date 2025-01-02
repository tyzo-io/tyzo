import { describe, expect, test } from "vitest";
import { z } from "zod";
import {
  assetSchema,
  imageSchema,
  videoSchema,
  richTextSchema,
  markdownSchema,
} from "../content";
import { convertZodSchema } from "../schemas";
import { convertLocalUrlsToRemote, convertRemoteUrlsToLocal } from "./urls";

describe("convertLocalUrlsToRemote", () => {
  const remoteBaseUrl = "https://api.tyzo.io";

  describe("asset types", () => {
    test("converts image URLs", () => {
      const schema = z.object({
        image: imageSchema,
      });

      const entry = {
        image: {
          url: "http://localhost:3456/api/assets/test-image.jpg",
          alt: "Test image",
          srcset:
            "http://localhost:3456/api/assets/test-image.jpg?w=200 200w, http://localhost:3456/api/assets/test-image.jpg?w=400 400w",
        },
      };

      const result = convertLocalUrlsToRemote({
        entry,
        remoteBaseUrl,
        schema: convertZodSchema(schema) as any,
      });

      expect(result).toEqual({
        image: {
          url: `${remoteBaseUrl}/assets/test-image.jpg`,
          alt: "Test image",
          srcset: `${remoteBaseUrl}/assets/test-image.jpg?w=200 200w, ${remoteBaseUrl}/assets/test-image.jpg?w=400 400w`,
        },
      });
    });

    test("converts video URLs", () => {
      const schema = z.object({
        video: videoSchema,
      });

      const entry = {
        video: {
          url: "http://localhost:3456/api/assets/test-video.mp4",
          alt: "Test video",
        },
      };

      const result = convertLocalUrlsToRemote({
        entry,
        remoteBaseUrl,
        schema: convertZodSchema(schema) as any,
      });

      expect(result).toEqual({
        video: {
          url: `${remoteBaseUrl}/assets/test-video.mp4`,
          alt: "Test video",
        },
      });
    });

    test("converts asset URLs", () => {
      const schema = z.object({
        file: assetSchema,
      });

      const entry = {
        file: {
          key: "test-file.pdf",
          url: "http://localhost:3456/api/assets/test-file.pdf",
        },
      };

      const result = convertLocalUrlsToRemote({
        entry,
        remoteBaseUrl,
        schema: convertZodSchema(schema) as any,
      });

      expect(result).toEqual({
        file: {
          key: "test-file.pdf",
          url: `${remoteBaseUrl}/assets/test-file.pdf`,
        },
      });
    });
  });

  describe("array handling", () => {
    test("converts URLs in arrays", () => {
      const schema = z.object({
        images: z.array(imageSchema),
      });

      const entry = {
        images: [
          {
            url: "http://localhost:3456/api/assets/image1.jpg",
            alt: "Image 1",
          },
          {
            url: "http://localhost:3456/api/assets/image2.jpg",
            alt: "Image 2",
          },
        ],
      };

      const result = convertLocalUrlsToRemote({
        entry,
        remoteBaseUrl,
        schema: convertZodSchema(schema) as any,
      });

      expect(result).toEqual({
        images: [
          {
            url: `${remoteBaseUrl}/assets/image1.jpg`,
            alt: "Image 1",
          },
          {
            url: `${remoteBaseUrl}/assets/image2.jpg`,
            alt: "Image 2",
          },
        ],
      });
    });
  });

  describe("nested objects", () => {
    test("converts URLs in nested objects", () => {
      const schema = z.object({
        section: z.object({
          header: z.object({
            image: imageSchema,
          }),
          content: z.object({
            video: videoSchema,
          }),
        }),
      });

      const entry = {
        section: {
          header: {
            image: {
              url: "http://localhost:3456/api/assets/header.jpg",
              alt: "Header image",
            },
          },
          content: {
            video: {
              url: "http://localhost:3456/api/assets/content.mp4",
              alt: "Content video",
            },
          },
        },
      };

      const result = convertLocalUrlsToRemote({
        entry,
        remoteBaseUrl,
        schema: convertZodSchema(schema) as any,
      });

      expect(result).toEqual({
        section: {
          header: {
            image: {
              url: `${remoteBaseUrl}/assets/header.jpg`,
              alt: "Header image",
            },
          },
          content: {
            video: {
              url: `${remoteBaseUrl}/assets/content.mp4`,
              alt: "Content video",
            },
          },
        },
      });
    });
  });

  // describe("rich text and markdown", () => {
  //   test("converts URLs in rich text", () => {
  //     const schema = z.object({
  //       content: richTextSchema,
  //     });

  //     const entry = {
  //       content: {
  //         richText: `
  //           Some text with an image:
  //           ![Alt text](/api/assets/image.jpg)
  //           And a link to a file:
  //           [Download PDF](/api/assets/document.pdf)
  //           And a direct URL:
  //           /api/assets/file.jpg
  //         `,
  //       },
  //     };

  //     const result = convertLocalUrlsToRemote({
  //       entry,
  //       remoteBaseUrl,
  //       schema,
  //     });

  //     expect(result.content.richText).toContain(
  //       `![Alt text](${remoteBaseUrl}/assets/image.jpg)`
  //     );
  //     expect(result.content.richText).toContain(
  //       `[Download PDF](${remoteBaseUrl}/assets/document.pdf)`
  //     );
  //     expect(result.content.richText).toContain(
  //       `${remoteBaseUrl}/assets/file.jpg`
  //     );
  //   });

  //   test("converts URLs in markdown", () => {
  //     const schema = z.object({
  //       content: markdownSchema,
  //     });

  //     const entry = {
  //       content: {
  //         markdown: `
  //           # Heading
  //           ![Image](/api/assets/test.jpg)
  //           [Link to file](/api/assets/doc.pdf)
  //           Direct URL: /api/assets/file.jpg
  //         `,
  //       },
  //     };

  //     const result = convertLocalUrlsToRemote({
  //       entry,
  //       remoteBaseUrl,
  //       schema,
  //     });

  //     expect(result.content.markdown).toContain(
  //       `![Image](${remoteBaseUrl}/assets/test.jpg)`
  //     );
  //     expect(result.content.markdown).toContain(
  //       `[Link to file](${remoteBaseUrl}/assets/doc.pdf)`
  //     );
  //     expect(result.content.markdown).toContain(
  //       `${remoteBaseUrl}/assets/file.jpg`
  //     );
  //   });
  // });

  describe("edge cases", () => {
    test("handles null values", () => {
      const schema = z.object({
        image: imageSchema.nullable(),
      });

      const entry = {
        image: null,
      };

      const result = convertLocalUrlsToRemote({
        entry,
        remoteBaseUrl,
        schema: convertZodSchema(schema) as any,
      });

      expect(result).toEqual({
        image: null,
      });
    });

    test("handles undefined values", () => {
      const schema = z.object({
        image: imageSchema.optional(),
      });

      const entry = {
        image: undefined,
      };

      const result = convertLocalUrlsToRemote({
        entry,
        remoteBaseUrl,
        schema: convertZodSchema(schema) as any,
      });

      expect(result).toEqual({
        image: undefined,
      });
    });

    test("ignores non-asset URLs", () => {
      const schema = z.object({
        link: z.string(),
      });

      const entry = {
        link: "https://example.com/image.jpg",
      };

      const result = convertLocalUrlsToRemote({
        entry,
        remoteBaseUrl,
        schema: convertZodSchema(schema) as any,
      });

      expect(result).toEqual({
        link: "https://example.com/image.jpg",
      });
    });
  });
});

describe("convertRemoteUrlsToLocal", () => {
  const remoteBaseUrl = "https://api.tyzo.io";

  describe("asset types", () => {
    test("converts image URLs", () => {
      const schema = z.object({
        image: imageSchema,
      });

      const entry = {
        image: {
          url: `${remoteBaseUrl}/assets/test-image.jpg`,
          alt: "Test image",
          srcset: `${remoteBaseUrl}/assets/test-image.jpg?w=200 200w, ${remoteBaseUrl}/assets/test-image.jpg?w=400 400w`,
        },
      };

      const result = convertRemoteUrlsToLocal({
        entry,
        remoteBaseUrl,
        schema: convertZodSchema(schema) as any,
      });

      expect(result).toEqual({
        image: {
          url: "http://localhost:3456/api/assets/test-image.jpg",
          alt: "Test image",
          srcset: "http://localhost:3456/api/assets/test-image.jpg?w=200 200w, http://localhost:3456/api/assets/test-image.jpg?w=400 400w",
        },
      });
    });

    test("converts video URLs", () => {
      const schema = z.object({
        video: videoSchema,
      });

      const entry = {
        video: {
          url: `${remoteBaseUrl}/assets/test-video.mp4`,
          alt: "Test video",
        },
      };

      const result = convertRemoteUrlsToLocal({
        entry,
        remoteBaseUrl,
        schema: convertZodSchema(schema) as any,
      });

      expect(result).toEqual({
        video: {
          url: "http://localhost:3456/api/assets/test-video.mp4",
          alt: "Test video",
        },
      });
    });

    test("converts asset URLs", () => {
      const schema = z.object({
        file: assetSchema,
      });

      const entry = {
        file: {
          key: "test-file.pdf",
          url: `${remoteBaseUrl}/assets/test-file.pdf`,
        },
      };

      const result = convertRemoteUrlsToLocal({
        entry,
        remoteBaseUrl,
        schema: convertZodSchema(schema) as any,
      });

      expect(result).toEqual({
        file: {
          key: "test-file.pdf",
          url: "http://localhost:3456/api/assets/test-file.pdf",
        },
      });
    });
  });

  describe("array handling", () => {
    test("converts URLs in arrays", () => {
      const schema = z.object({
        images: z.array(imageSchema),
      });

      const entry = {
        images: [
          {
            url: `${remoteBaseUrl}/assets/image1.jpg`,
            alt: "Image 1",
          },
          {
            url: `${remoteBaseUrl}/assets/image2.jpg`,
            alt: "Image 2",
          },
        ],
      };

      const result = convertRemoteUrlsToLocal({
        entry,
        remoteBaseUrl,
        schema: convertZodSchema(schema) as any,
      });

      expect(result).toEqual({
        images: [
          {
            url: "http://localhost:3456/api/assets/image1.jpg",
            alt: "Image 1",
          },
          {
            url: "http://localhost:3456/api/assets/image2.jpg",
            alt: "Image 2",
          },
        ],
      });
    });
  });

  describe("nested objects", () => {
    test("converts URLs in nested objects", () => {
      const schema = z.object({
        content: z.object({
          image: imageSchema,
          video: videoSchema,
        }),
      });

      const entry = {
        content: {
          image: {
            url: `${remoteBaseUrl}/assets/image.jpg`,
            alt: "Image",
          },
          video: {
            url: `${remoteBaseUrl}/assets/video.mp4`,
            alt: "Video",
          },
        },
      };

      const result = convertRemoteUrlsToLocal({
        entry,
        remoteBaseUrl,
        schema: convertZodSchema(schema) as any,
      });

      expect(result).toEqual({
        content: {
          image: {
            url: "http://localhost:3456/api/assets/image.jpg",
            alt: "Image",
          },
          video: {
            url: "http://localhost:3456/api/assets/video.mp4",
            alt: "Video",
          },
        },
      });
    });
  });

  describe("rich text and markdown", () => {
    test("converts URLs in rich text", () => {
      const schema = z.object({
        content: richTextSchema,
      });

      const entry = {
        content: {
          richText: `Some text with an image ![Alt text](${remoteBaseUrl}/assets/image.jpg) and more text`,
        },
      };

      const result = convertRemoteUrlsToLocal({
        entry,
        remoteBaseUrl,
        schema: convertZodSchema(schema) as any,
      });

      expect(result.content.richText).toContain(
        "![Alt text](http://localhost:3456/api/assets/image.jpg)"
      );
    });

    test("converts URLs in markdown", () => {
      const schema = z.object({
        content: markdownSchema,
      });

      const entry = {
        content: {
          markdown: `Some text with an image ![Alt text](${remoteBaseUrl}/assets/image.jpg) and more text`,
        },
      };

      const result = convertRemoteUrlsToLocal({
        entry,
        remoteBaseUrl,
        schema: convertZodSchema(schema) as any,
      });

      expect(result.content.markdown).toContain(
        "![Alt text](http://localhost:3456/api/assets/image.jpg)"
      );
    });
  });
});
