import { Id } from "../types";
import type { SerializedCollection, SerializedGlobal } from "../localServer";
import { apiClient } from "./values";
export * from "./values";

export function managementApiClient(options: {
  API_URL: string;
  token: string;
}) {
  const { API_URL } = options;
  const token = options.token;

  // Schema
  async function getSchema() {
    console.log('schema', API_URL)
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
    console.log(schema)
    const res = await fetch(`${API_URL}/schema`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(schema),
    });
    const data = (await res.json()) as {
      collections: Record<string, SerializedCollection>;
      globals: Record<string, SerializedGlobal>;
    };
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );
    return res.json();
  }

  async function deleteEntry(collection: string, id: Id): Promise<boolean> {
    const res = await fetch(
      `${API_URL}/collections/${collection}/entries/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: "DELETE",
      }
    );
    return res.ok;
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
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  }

  // Assets
  async function uploadAsset(
    file: Buffer,
    options: { filename: string; contentType?: string }
  ): Promise<{ success: boolean }> {
    const res = await fetch(`${API_URL}/assets/${options.filename}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": options.contentType ?? "application/octet-stream",
      },
      body: file,
    });
    return res.json();
  }

  async function deleteAsset(filename: string): Promise<boolean> {
    const res = await fetch(`${API_URL}/assets/${filename}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.ok;
  }
  return {
    ...apiClient(options),
    getSchema,
    updateSchema,
    setEntry,
    deleteEntry,
    setGlobalValue,
    uploadAsset,
    deleteAsset,
    apiUrl: API_URL,
  };
}
