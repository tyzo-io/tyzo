import { getYjsDoc, syncedStore } from "@syncedstore/core";
import { useSyncedStore } from "@syncedstore/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useComponents } from "./useComponents";
import { Page } from "./types";
import { useBackend } from "./components/EditorBackend";
import * as Y from "yjs";

function debounce<T extends () => void>(fn: T, timeout: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return () => {
    const later = () => {
      clearTimeout(timer);
      fn();
    };

    clearTimeout(timer);
    timer = setTimeout(later, timeout);
  };
}

const store = syncedStore({ pageContainer: {} as { page?: Page } });

export function usePage({ id }: { id: string }) {
  const { backend } = useBackend();
  const { components } = useComponents();
  const state = useSyncedStore(store);
  const page = state.pageContainer.page;
  const undoManager = useMemo(() => {
    const doc = getYjsDoc(store);
    const container = doc.getMap("pageContainer");
    return new Y.UndoManager(container);
  }, []);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const loadData = useCallback(async () => {
    const page = await backend.loadPage(id);
    state.pageContainer.page = page ?? undefined;

    async function save() {
      if (state.pageContainer.page) {
        setIsSaving(true);
        await backend.savePage(state.pageContainer.page, components);
        setIsSaving(false);
        setHasChanges(false);
      }
    }

    const triggerSave = debounce(save, 3000);

    const doc = getYjsDoc(store);
    doc.getMap("pageContainer").observeDeep(() => {
      setHasChanges(true);
      triggerSave();
    });
  }, [backend, components, id, state.pageContainer]);

  useEffect(() => {
    loadData();
  }, [id]);

  return {
    page,
    undoManager,
    isSaving,
    hasChanges,
  };
}
