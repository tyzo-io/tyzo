# Tyzo CMS

A modern, type safe Content Management System.

## Getting Started

### Installation

```bash
npm install tyzo
# or
pnpm add tyzo
# or
yarn add tyzo
```

### Setting Up Your Content

Define your collections and globals using our type-safe schema builder:

```typescript
import {
  defineCollection,
  defineGlobal,
  entryReference,
  imageSchema,
  markdownSchema,
  richTextSchema,
  tyzoApi,
  z,
} from 'tyzo';

// Initialize the CMS client
const cms = tyzoApi({ space: "your-space-name" });

// Define an author collection
const authorCollection = defineCollection({
  name: "author",
  idField: "name",
  schema: z.object({
    name: z.string(),
    bio: z.string(),
  }),
});

// Define a posts collection with references and rich content
const postCollection = defineCollection({
  name: "posts",
  idField: "slug",
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    content: richTextSchema,
    image: imageSchema,
    author: entryReference<typeof authorCollection>("author"),
    tags: z.array(z.string()),
    publishedAt: z.date(),
  }),
});

// Define global content
const settings = defineGlobal({
  name: "settings",
  schema: z.object({
    siteName: z.string(),
    description: z.string(),
  }),
});
```

### Content Authoring

After defining your collections, start the CMS UI to begin authoring content:

```bash
pnpm tyzo dev
```

Visit the admin UI to create and manage your content with a beautiful interface.

### Fetch Content

Use the CMS client to fetch your content with full type safety:

```typescript
// Fetch entries from a collection
const { entries: posts } = await cms.getEntries(postCollection, {
  // Include referenced collections
  include: {
    author: true,
  },
  // Optional: filter and sort
  where: {
    publishedAt: { gt: new Date('2024-01-01') },
  },
  sort: { publishedAt: 'desc' },
});

// Fetch a single entry by ID
const post = await cms.getEntry(postCollection, 'my-post-slug');

// Fetch global content
const { global: settings } = await cms.getGlobal(settings);

// Use in React components
function BlogPosts() {
  const [posts, setPosts] = useState();

  useEffect(() => {
    cms.getEntries(postCollection)
      .then(({ entries }) => setPosts(entries));
  }, []);

  return (
    <ul>
      {posts?.map(post => (
        <li key={post.slug}>
          <h2>{post.title}</h2>
          <p>By: {post.author.name}</p>
        </li>
      ))}
    </ul>
  );
}
```

All queries are fully typed, providing autocomplete and type checking for your content structure.

## Features

- Type-safe content fetching
- Built-in asset management
- Flexible content modeling
- Rich text editor
- Image optimization
- Global, super fast CDN

## Documentation

For detailed documentation and advanced usage, visit our [documentation site](https://www.tyzo.io/docs).
