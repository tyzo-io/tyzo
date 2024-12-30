import { useCallback, useEffect, useState } from "react";
import { Sort, Where, type Tyzo } from "./content.js";
import type {
  Collection,
  CollectionEntry,
  Global,
  GlobalValue,
  RelationshipsFlags,
} from "./types";

export function useCollectionEntry<T extends Collection<any>>(
  api: Tyzo,
  collection: T | undefined,
  entryId: string | undefined
) {
  const [entry, setEntry] = useState<CollectionEntry<T> | null>(null);
  const [loading, setLoading] = useState(Boolean(collection && entryId));
  const doFetch = useCallback(() => {
    if (collection && entryId) {
      setLoading(true);
      api.getEntry(collection, entryId).then((data) => {
        setEntry(data?.entry);
        setLoading(false);
      });
    }
  }, [collection, entryId]);

  useEffect(() => {
    doFetch();
  }, [collection, entryId]);
  return {
    entry,
    loading,
    refetch: () => {
      doFetch();
    },
  };
}

export function useCollectionEntries<
  T extends Collection<any>,
  I extends T extends Collection<infer C, infer U>
    ? RelationshipsFlags<C>
    : Record<string, boolean>
>(
  api: Tyzo,
  collection: T | undefined,
  options?: {
    includeCount?: boolean;
    include?: I;
    limit?: number;
    offset?: number;
    filters?: Where<CollectionEntry<T>>;
    sort?: Sort<CollectionEntry<T>>;
    skip?: boolean;
  }
) {
  const [entries, setEntries] = useState<CollectionEntry<T>[] | null>(null);
  const [loading, setLoading] = useState(Boolean(collection && !options?.skip));
  const doFetch = useCallback(() => {
    if (collection && !options?.skip) {
      setLoading(true);
      api.getEntries(collection, options).then((data) => {
        setEntries(data?.entries);
        setLoading(false);
      });
    }
  }, [
    collection,
    options?.skip,
    options?.sort,
    options?.filters,
    options?.limit,
    options?.offset,
    options?.include,
    options?.includeCount,
  ]);

  useEffect(() => {
    doFetch();
  }, [
    collection,
    options?.skip,
    options?.sort,
    options?.filters,
    options?.limit,
    options?.offset,
    options?.include,
    options?.includeCount,
  ]);
  return {
    entries,
    loading,
    refetch: () => {
      doFetch();
    },
  };
}

export function useGlobal<T extends Global<any>>(
  api: Tyzo,
  global: T | undefined
) {
  const [globalValue, setGlobalValue] = useState<GlobalValue<T> | null>(null);
  const [loading, setLoading] = useState(Boolean(global));

  const doFetch = useCallback(() => {
    if (global) {
      setLoading(true);
      api.getGlobal(global).then((data) => {
        setGlobalValue(data?.global);
        setLoading(false);
      });
    }
  }, [global]);

  useEffect(() => {
    doFetch();
  }, [global]);

  return {
    globalValue,
    loading,
    refetch: () => {
      doFetch();
    },
  };
}
