import { EditorBackend } from "../../types";
import React, { createContext, useContext } from "react";

const defaultBackend = (): EditorBackend => {
  return {
    loadComponentGroups: () => {
      throw new Error("No backend configured");
    },
    loadComponents: () => {
      throw new Error("No backend configured");
    },
    loadPage: () => {
      throw new Error("No backend configured");
    },
    loadPages: () => {
      throw new Error("No backend configured");
    },
    saveComponentInfo: () => {
      throw new Error("No backend configured");
    },
    savePage: () => {
      throw new Error("No backend configured");
    },

    inputs: {},
    supportsUpdatingComponents: false,
  };
};

const EditorBackendContext = createContext({
  backend: defaultBackend(),
});

export function EditorBackendProvider({
  backend,
  children,
}: {
  backend: EditorBackend;
  children: React.ReactNode | React.JSX.Element;
}) {
  return (
    <EditorBackendContext.Provider
      value={{
        backend,
      }}
    >
      {children}
    </EditorBackendContext.Provider>
  );
}

export function useBackend() {
  const { backend } = useContext(EditorBackendContext);
  return {
    backend,
  };
}
