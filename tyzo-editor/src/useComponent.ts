import { useCallback, useEffect, useState } from "react";
import { useBackend } from "./components/EditorBackend";
import { ComponentInfo } from "./types";

export function useComponent(id: string | undefined) {
  const { backend } = useBackend();

  const [storedInfo, setStoredInfo] = useState<ComponentInfo>();

  const refresh = useCallback(() => {
    if (id) {
      backend.loadComponents().then((infos) => {
        const loadedInfo = infos.find((loadedInfo) => loadedInfo.id === id);
        setStoredInfo(loadedInfo);
      });
    } else {
      setStoredInfo(undefined);
    }
  }, [id, backend]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!storedInfo) {
    return {
      refresh,
    };
  }

  return {
    refresh,
    component: {
      ...(storedInfo ?? {}),
    },
  };
}
