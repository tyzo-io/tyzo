import React from "react";
import { useState, useEffect, createContext, useContext } from "react";
import { managementApiClient } from "../apiClient";
import { Id } from "../types";
import { Where } from "../filters";

export const localApiUrl = "http://localhost:3456/api";

const ApiClientContext = createContext({
  apiClient: {} as ReturnType<typeof managementApiClient>,
  setApiUrl: (url: string, token: string) => {},
});

export const ApiProvider = ({
  children,
  apiUrl,
}: {
  children: React.ReactNode;
  apiUrl: string;
}) => {
  const [client, setClient] = useState(() =>
    managementApiClient({ API_URL: apiUrl, token: "" })
  );
  return (
    <ApiClientContext.Provider
      value={{
        apiClient: client,
        setApiUrl: (url, token) => {
          setClient(managementApiClient({ API_URL: url, token }));
        },
      }}
    >
      {children}
    </ApiClientContext.Provider>
  );
};

export function useApiClient() {
  const context = useContext(ApiClientContext);
  if (!context) throw new Error("useApiClient must be used within ApiProvider");
  return context.apiClient;
}

export function useApiClientContext() {
  const context = useContext(ApiClientContext);
  if (!context) throw new Error("useApiClient must be used within ApiProvider");
  return context;
}

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  enabled?: boolean;
}

// Generic hook for data fetching
function useApi<T>(
  fetcher: () => Promise<T>,
  deps: any[] = [],
  options: UseApiOptions = {}
): UseApiState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: Boolean(options.enabled),
    error: null,
  });

  const fetchData = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetcher();
      setState({ data, loading: false, error: null });
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err.message || "An error occurred",
      }));
    }
  };

  useEffect(() => {
    if (options.enabled === false) return;
    fetchData();
  }, [...deps, options.enabled]);

  return { ...state, refetch: fetchData };
}

// Collection hooks
export function useSchema() {
  const api = useApiClient();
  return useApi(() => api.getSchema(), []);
}

export function useCollection(collectionName: string | undefined) {
  const api = useApiClient();
  return useApi(
    () =>
      api
        .getSchema()
        .then((cols) =>
          collectionName
            ? {
                collection: cols.collections[collectionName],
                collections: cols.collections,
              }
            : undefined
        ),
    [collectionName],
    { enabled: Boolean(collectionName) }
  );
}

export function useEntries<T = any>(
  collectionName: string | undefined,
  filters?: Where<T>
) {
  const api = useApiClient();
  return useApi<{ entries: T[] }>(
    () => api.getEntries(collectionName!, { filters }),
    [collectionName, filters],
    {
      enabled: !!collectionName,
    }
  );
}

export function useEntry<T = any>(
  collectionName: string | undefined,
  id: Id | undefined
) {
  const api = useApiClient();
  return useApi<{ entry: T | null }>(
    () => api.getEntry(collectionName!, id!),
    [collectionName, id],
    { enabled: !!collectionName && !!id }
  );
}

// Global hooks
export function useGlobals() {
  const api = useApiClient();
  return useApi(() => api.getSchema(), []);
}

export function useGlobal(name: string) {
  const api = useApiClient();
  return useApi(
    () =>
      api.getSchema().then((cols) => (name ? cols.globals[name] : undefined)),
    [name]
  );
}

export function useGlobalValue<T = any>(globalName: string | undefined) {
  const api = useApiClient();
  return useApi<{ global: T | null }>(
    () => api.getGlobalValue(globalName!),
    [globalName],
    {
      enabled: !!globalName,
    }
  );
}

// Mutation hooks
interface UseMutationState<T> {
  loading: boolean;
  error: string | null;
  data: T | null;
}

interface UseMutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

function useMutation<TData = any, TInput = any>(
  mutator: (input: TInput) => Promise<TData>,
  options: UseMutationOptions<TData> = {}
) {
  const [state, setState] = useState<UseMutationState<TData>>({
    loading: false,
    error: null,
    data: null,
  });

  const mutate = async (input: TInput) => {
    setState({ loading: true, error: null, data: null });
    try {
      const data = await mutator(input);
      setState({ loading: false, error: null, data });
      options.onSuccess?.(data);
      return data;
    } catch (err: any) {
      const error = new Error(err.message || "An error occurred");
      setState({ loading: false, error: error.message, data: null });
      options.onError?.(error);
      throw error;
    }
  };

  return { ...state, mutate };
}

// Collection mutation hooks
export function usePutEntry<T = any>(collectionName: string | undefined) {
  const api = useApiClient();
  return useMutation<any, { id: string; data: T }>((data) =>
    api.setEntry(collectionName!, data.id, data.data)
  );
}

export function useDeleteEntry(collectionName: string | undefined) {
  const api = useApiClient();
  return useMutation<boolean, Id>((id) =>
    api.deleteEntry(collectionName!, id.toString())
  );
}

// Global mutation hooks
export function useUpdateGlobalValue<T = any>(globalName: string | undefined) {
  const api = useApiClient();
  return useMutation<any, T>((data) => api.setGlobalValue(globalName!, data));
}

// Assets hooks
export function useAssets() {
  const api = useApiClient();
  return useApi(() => api.listAssets(), []);
}

export function useUploadAsset() {
  const api = useApiClient();
  return useMutation(async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${localApiUrl}/assets/${file.name}`, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to upload file');
    }
    return response.json();
  });
}

export function useDeleteAsset() {
  const api = useApiClient();
  return useMutation(async (key: string) => {
    const response = await fetch(`${localApiUrl}/assets/${key}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error('Failed to delete file');
    }
    return response.json();
  });
}
