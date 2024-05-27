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
  basePath: "",
  backend: defaultBackend(),
});

export function EditorBackendProvider({
  basePath,
  backend,
  children,
}: {
  basePath: string;
  backend: EditorBackend;
  children: React.ReactNode | React.JSX.Element;
}) {
  return (
    <EditorBackendContext.Provider
      value={{
        basePath,
        backend,
      }}
    >
      {children}
    </EditorBackendContext.Provider>
  );
}

export function useBackend() {
  const { basePath, backend } = useContext(EditorBackendContext);
  return {
    basePath,
    backend,
  };
}
