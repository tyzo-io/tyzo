import React from "react";
import {
  assetSchema,
  defineCollection,
  defineGlobal,
  entryReference,
  imageSchema,
  markdownSchema,
  richTextSchema,
  videoSchema,
  tyzoApi,
  z,
} from "../../src/content";
import { useState } from "react";
import { useEffect } from "react";

const cms = tyzoApi({ space: "example", useLocalApi: true });

const authorCollection = defineCollection({
  name: "author",
  idField: "name",
  schema: z.object({
    name: z.string(),
    bio: z.string(),
  }),
});

const postCollection = defineCollection({
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
    someNume: z.number(),
    email: z.string().email(),
    date: z.date(),
    duration: z.string().duration(),
    tags: z.array(z.string()),
    objectArray: z.array(z.object({ key: z.string(), value: z.string() })),
    image: imageSchema,
    video: videoSchema,
    file: assetSchema,
    author: entryReference<typeof authorCollection>("author"),
  }),
});

export const collections = {
  author: authorCollection,
  posts: postCollection,
};

export const globals = {
  pageSettings: defineGlobal({
    name: "pageSettings",
    schema: z.object({
      title: z.string(),
    }),
  }),
};

async function loadData() {
  const { entries: posts } = await cms.getEntries(collections.posts, {
    include: {
      author: true,
    },
  });
  const { global: pageSettings } = await cms.getGlobal(globals.pageSettings);
  return { posts, pageSettings };
}

export function App() {
  const [data, setData] = useState<Awaited<ReturnType<typeof loadData>>>();
  const { posts, pageSettings } = data ?? {};

  useEffect(() => {
    loadData().then(setData);
  }, []);

  return (
    <div>
      {pageSettings && <h1>{pageSettings.title}</h1>}
      <h2>Posts</h2>
      <ul>
        {posts?.map((post) => (
          <li key={post.slug}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
            <p>By {post.author.entry.name}</p>
            <p>
              On {post.date.toLocaleDateString()}
            </p>
            <img
              src={"key" in post.image ? post.image.key : post.image.src}
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
