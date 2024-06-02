import { getYjsDoc, syncedStore } from "@syncedstore/core";
import { useSyncedStore } from "@syncedstore/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const observerRef =
    useRef<(arg0: Y.YEvent<any>[], arg1: Y.Transaction) => void>();

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
    const observer = (arg0: Y.YEvent<any>[]) => {
      const hasRealChanges = arg0.some((e) => {
        for (const key of e.changes.keys.keys()) {
          if (key !== "page") {
            return true;
          }
        }
      });
      if (!hasRealChanges) {
        return;
      }
      setHasChanges(true);
      triggerSave();
    };
    if (observerRef.current) {
      doc.getMap("pageContainer").unobserveDeep(observerRef.current);
    }
    doc.getMap("pageContainer").observeDeep(observer);
    observerRef.current = observer;
  }, [backend, id, components, state.pageContainer]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        const doc = getYjsDoc(store);
        doc.getMap("pageContainer").unobserveDeep(observerRef.current);
        observerRef.current = undefined;
      }
    };
  }, []);

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
