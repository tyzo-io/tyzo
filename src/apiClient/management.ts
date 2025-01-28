import { SerializedCollection, SerializedGlobal } from "../schemas";
import { Asset, Id } from "../types";
import { apiClient } from "./values";
export * from "./values";

export function managementApiClient(options: {
  API_URL: string;
  token: () => string | null;
}) {
  const { API_URL } = options;
  const token = options.token;

  // Schema
  async function getSchema() {
    const res = await fetch(`${API_URL}/schema`);
    const data = (await res.json()) as {
      collections: Record<string, SerializedCollection>;
      globals: Record<string, SerializedGlobal>;
    };
    return data;
  }

  async function updateSchema(schema: {
    stage: string;
    collections: Record<string, SerializedCollection>;
    globals: Record<string, SerializedGlobal>;
  }) {
    const res = await fetch(`${API_URL}/schema`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token()}`,
      },
      body: JSON.stringify(schema),
    });
    const data = (await res.json()) as {
      collections: Record<string, SerializedCollection>;
      globals: Record<string, SerializedGlobal>;
    };
    if (!res.ok) {
      console.log(data);
      throw new Error("Failed to update schema");
    }
    return data;
  }

  // Collections
  async function setEntry<T>(
    collection: string,
    id: Id,
    data: T
  ): Promise<{ success: boolean }> {
    const res = await fetch(
      `${API_URL}/collections/${collection}/entries/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify(data),
      }
    );
    const result = await res.json();
    if (!res.ok) {
      console.log(result);
      throw new Error("Failed to update entry");
    }
    return result;
  }

  async function deleteEntry(collection: string, id: Id): Promise<boolean> {
    const res = await fetch(
      `${API_URL}/collections/${collection}/entries/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token()}`,
        },
        method: "DELETE",
      }
    );
    const result = await res.json();
    if (!res.ok) {
      console.log(result);
      throw new Error("Failed to delete entry");
    }
    return result;
  }

  // Globals
  async function setGlobalValue<T>(
    global: string,
    data: T
  ): Promise<{ success: boolean }> {
    const res = await fetch(`${API_URL}/globals/${global}/value`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token()}`,
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      console.log(result);
      throw new Error("Failed to update global");
    }
    return result;
  }

  // Assets
  async function uploadAsset(
    file: Buffer,
    options: {
      filename: string;
      contentType?: string;
      width?: number;
      height?: number;
    }
  ): Promise<{ success: boolean }> {
    const formData = new FormData();
    const blob = new Blob([file], {
      type: options.contentType || "application/octet-stream",
    });
    formData.append("file", blob, options.filename);
    if (options.contentType) {
      formData.append("contentType", options.contentType);
    }
    if (options.width && options.height) {
      formData.append("width", options.width.toString());
      formData.append("height", options.height.toString());
    }
    const res = await fetch(`${API_URL}/assets/${options.filename}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token()}`,
      },
      body: formData,
    });
    return res.json();
  }

  async function listAssets(options?: {
    search?: string;
    limit?: number;
    startAfter?: string;
  }) {
    const query = new URLSearchParams();
    if (options?.search) {
      query.set("search", options.search);
    }
    if (options?.limit) {
      query.set("limit", options.limit.toString());
    }
    if (options?.startAfter) {
      query.set("startAfter", options.startAfter);
    }
    const res = await fetch(`${API_URL}/assets?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${token()}`,
      },
    });
    return (await res.json()) as { assets: Asset[] };
  }

  async function deleteAsset(filename: string): Promise<boolean> {
    const res = await fetch(`${API_URL}/assets/${filename}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token()}`,
      },
    });
    return res.ok;
  }

  async function downloadAsset(key: string) {
    const res = await fetch(`${API_URL}/assets/${key}`);
    return res;
  }

  return {
    ...apiClient(options),
    getSchema,
    listAssets,
    updateSchema,
    setEntry,
    deleteEntry,
    setGlobalValue,
    uploadAsset,
    deleteAsset,
    downloadAsset,
    apiUrl: API_URL,
    token,
  };
}
