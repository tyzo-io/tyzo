// import path from 'node:path';
// import { fileURLToPath } from 'node:url';
import type { AstroConfig, AstroIntegration } from "astro";
import type { TyzoConfig } from "./tyzo-service/config";
// import type { EnumChangefreq, LinkItem as LinkItemBase, SitemapItemLoose } from 'sitemap';
// import { ZodError } from 'zod';

// import { generateSitemap } from './generate-sitemap.js';
// import { validateOptions } from './validate-options.js';
// import { writeSitemap } from './write-sitemap.js';

const PKG_NAME = "@tyzo/astro";
// const OUTFILE = 'sitemap-index.xml';
// const STATUS_CODE_PAGES = new Set(['404', '500']);

// function isStatusCodePage(pathname: string): boolean {
// 	if (pathname.endsWith('/')) {
// 		pathname = pathname.slice(0, -1);
// 	}
// 	const end = pathname.split('/').pop() ?? '';
// 	return STATUS_CODE_PAGES.has(end);
// }

export interface TyzoOptions {
  // storeUrl: string;
  spaceId?: string;
  renderTreeId?: string;
  configPath?: string;
  adminPath?: string;
  pagesPath?: string;
  componentsImport?: string;
}

const createPlugin = (options?: TyzoOptions): AstroIntegration => {
  let config: AstroConfig;

  return {
    name: PKG_NAME,

    hooks: {
      "astro:config:setup": async ({ updateConfig, injectRoute }) => {
        updateConfig({
          vite: {
            define: {
              __TYZO_CONFIG_PATH__: JSON.stringify(
                options?.configPath ?? "./tyzo-service/serviceClient.ts"
              ),
              __TYZO_SPACE_ID__: JSON.stringify(options?.spaceId),
              __TYZO_TREE_ID__: JSON.stringify(options?.renderTreeId ?? "main"),
              __TYZO_COMPONENT_IMPORT__: JSON.stringify(
                options?.componentsImport ?? "src/components/index.tsx"
              ),
            },
          },
        });

        injectRoute({
          pattern: options?.adminPath ?? "/admin/[...path]",
          // entrypoint: "@bloksy/astro/admin.astro",
          entrypoint: "./admin.astro",
        });
        injectRoute({
          pattern: options?.pagesPath ?? "/[...path]",
          // entrypoint: "@bloksy/astro/pages.astro",
          entrypoint: "./pages.astro",
        });
      },
      "astro:config:done": async ({ config: cfg }) => {
        config = cfg;
      },
    },
  };
};

export default createPlugin;
