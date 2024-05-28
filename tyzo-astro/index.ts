// import path from 'node:path';
// import { fileURLToPath } from 'node:url';
import type { AstroConfig, AstroIntegration } from "astro";
import path from "path";
// import type { TyzoConfig } from "@tyzo/core";
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
  spaceId?: string;
  renderTreeId?: string;
  serviceClientImportPath?: string;
  adminRoute?: string;
  pagesRoute?: string;
  componentsImportPath?: string;
  pageLayoutImportPath?: string;
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
                options?.serviceClientImportPath ??
                  "./tyzo-service/serviceClient.ts"
              ),
              __TYZO_SPACE_ID__: JSON.stringify(options?.spaceId),
              __TYZO_TREE_ID__: JSON.stringify(options?.renderTreeId ?? null),
              __TYZO_COMPONENT_IMPORT__: JSON.stringify(
                path.resolve(
                  options?.componentsImportPath ?? "src/components/index.tsx"
                )
              ),
              __TYZO_LAYOUT_IMPORT__: JSON.stringify(
                options?.pageLayoutImportPath
                  ? path.resolve(options?.pageLayoutImportPath)
                  : null
              ),
            },
          },
        });

        injectRoute({
          pattern: options?.adminRoute ?? "/admin/[...path]",
          // entrypoint: "@bloksy/astro/admin.astro",
          entrypoint: "@tyzo/astro/admin.astro",
        });
        injectRoute({
          pattern: options?.pagesRoute ?? "/[...path]",
          // entrypoint: "@bloksy/astro/pages.astro",
          entrypoint: "@tyzo/astro/pages.astro",
        });
      },
      "astro:config:done": async ({ config: cfg }) => {
        config = cfg;
      },
    },
  };
};

export default createPlugin;
