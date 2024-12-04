import React from "react";
import {
  assetSchema,
  defineCollection,
  defineGlobal,
  entryReference,
  getEntries,
  getGlobal,
  imageSchema,
  InferredCollectionItem,
  InferredGlobalItem,
  markdownSchema,
  richTextSchema,
  videoSchema,
  z,
} from "../../src/content";
import { useState } from "react";
import { useEffect } from "react";

export const collections = {
  author: defineCollection({
    name: "author",
    idField: "name",
    schema: z.object({
      name: z.string(),
      bio: z.string(),
    }),
  }),
  posts: defineCollection({
    name: "posts",
    idField: "slug",
    schema: z.object({
      slug: z.string(),
      title: z.string(),
      content: z.string(),
      markdown: markdownSchema,
      richText: richTextSchema,
      id: z.string().uuid(),
      url: z.string().url(),
      bool: z.boolean(),
      email: z.string().email(),
      date: z.date(),
      duration: z.string().duration(),
      tags: z.array(z.string()),
      image: imageSchema,
      video: videoSchema,
      file: assetSchema,
      author: entryReference("author"),
    }),
  }),
};

export const globals = {
  pageSettings: defineGlobal({
    name: "pageSettings",
    schema: z.object({
      title: z.string(),
    }),
  }),
};

export function App() {
  const [posts, setPosts] = useState<
    InferredCollectionItem<typeof collections.posts>[]
  >([]);
  const [pageSettings, setPageSettings] =
    useState<InferredGlobalItem<typeof globals.pageSettings>>();
  useEffect(() => {
    getEntries(collections.posts).then(({ entries }) => setPosts(entries));
    getGlobal(globals.pageSettings).then(({ global }) =>
      setPageSettings(global)
    );
  }, []);
  return (
    <div>
      {pageSettings && <h1>{pageSettings.title}</h1>}
      <h2>Posts</h2>
      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
            <img
              src={'key' in post.image ? post.image.key : post.image.url}
              alt={post.image.alt}
              width={post.image.width}
              height={post.image.height}
              srcSet={post.image.srcset}
              sizes={post.image.sizes}
            />
            <div
              dangerouslySetInnerHTML={{ __html: post.richText.richText }}
            ></div>
          </li>
        ))}
      </ul>
    </div>
  );
}
