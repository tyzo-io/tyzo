import { makeAssetUrl } from "../content";
import { Asset, Id } from "../types";

export function apiClient(options: { API_URL: string }) {
  const API_URL = options?.API_URL;

  // Collections
  async function getEntries<T>(
    collection: string,
    options?: {
      includeCount?: boolean;
      limit?: number;
      offset?: number;
      filters?: Record<string, any>;
      sort?: [keyof T, "asc" | "desc"][];
    }
  ) {
    const params = new URLSearchParams();
    if (options?.includeCount) params.set("includeCount", "true");
    if (options?.limit) params.set("limit", options.limit.toString());
    if (options?.offset) params.set("offset", options.offset.toString());
    if (options?.filters)
      params.set("filters", JSON.stringify(options.filters));
    if (options?.sort) params.set("sort", JSON.stringify(options.sort));
    const res = await fetch(
      `${API_URL}/collections/${collection}/entries?${params.toString()}`
    );
    const data = (await res.json()) as {
      entries: T[];
      limit: number;
      offset: number;
      count?: number;
    };
    return data;
  }

  async function getEntry<T>(collection: string, id: Id) {
    const res = await fetch(
      `${API_URL}/collections/${collection}/entries/${id}`
    );
    if (!res.ok) return { entry: null };
    const data = (await res.json()) as { entry: T | null };
    return data;
  }

  async function getGlobalValue<T>(global: string) {
    const res = await fetch(`${API_URL}/globals/${global}/value`);
    if (!res.ok) return { global: null };
    return (await res.json()) as { global: T | null };
  }

  // Assets
  async function listAssets() {
    const res = await fetch(`${API_URL}/assets`);
    return (await res.json()) as { assets: Asset[] };
  }

  async function getAsset(filename: string) {
    const res = await fetch(`${API_URL}/assets/${filename}`);
    if (!res.ok) return null;
    return (await res.json()) as { asset: Asset | null };
  }

  function getAssetUrl(
    filename: string,
    options?: {
      width?: number;
      height?: number;
      format?: "avif" | "webp" | "jpeg" | "png";
      quality?: number;
    }
  ) {
    return makeAssetUrl(filename, options);
  }

  return {
    getEntries,
    getEntry,
    getGlobalValue,
    listAssets,
    getAsset,
    getAssetUrl,
  };
}
