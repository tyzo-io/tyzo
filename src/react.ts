import { useCallback, useEffect, useState } from "react";
import { getEntry } from "./content";
import { Collection, CollectionEntry } from "./types";

export function useCollectionEntry<T extends Collection<any>>(
  collection: T | undefined,
  entryId: string | undefined
) {
  const [entry, setEntry] = useState<CollectionEntry<T> | null>(null);
  const [loading, setLoading] = useState(Boolean(collection && entryId));
  const doFetch = useCallback(() => {
    if (collection && entryId) {
      setLoading(true);
      getEntry(collection, entryId).then((data) => {
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
