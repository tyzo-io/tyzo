import { createContext, useContext, useMemo, useState } from "react";
import type { Tree, TyzoConfig } from "@/tyzo-service/config";
import serviceClientConfig from "@/tyzo-service/serviceClient";
import { useData } from "@/lib/useData";

const ConfigContext = createContext<
  TyzoConfig & { componentsImportPath: string }
>({} as TyzoConfig & { componentsImportPath: string });

export function useConfig() {
  return useContext(ConfigContext);
}

export function ConfigProvider({
  spaceId,
  children,
  componentsImportPath,
}: {
  spaceId: string | null | undefined;
  children: React.ReactNode;
  componentsImportPath: string;
}) {
  const config = useMemo(() => {
    if (!spaceId) {
      return null;
    }
    return serviceClientConfig({ spaceId });
  }, [spaceId]);

  if (!config) {
    return <div>No space id passed in your config</div>;
  }

  return (
    <ConfigContext.Provider value={{ ...config, componentsImportPath }}>
      {children}
    </ConfigContext.Provider>
  );
}
const TreeContext = createContext<{
  selectTree: (tree: Tree | null) => void;
  tree: Tree | null;
  refetchTrees: () => Promise<void>;
  availableTrees: Tree[] | undefined;
}>({
  tree: null,
  selectTree() {},
  async refetchTrees() {},
  availableTrees: [],
});

export function useTree() {
  return useContext(TreeContext);
}

export function TreeProvider({ children }: { children: React.ReactNode }) {
  const config = useConfig();
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);

  const { data, refetch } = useData(async () => {
    const trees = await config.trees.list();
    const savedTreeId = localStorage.getItem("tyzo-tree-id");
    if (savedTreeId) {
      const tree = trees.data.find((tree) => tree.id === savedTreeId);
      if (tree) {
        setSelectedTree(tree);
        return trees;
      }
    }
    if (trees.data.length === 1) {
      setSelectedTree(trees.data[0]);
    }
    return trees;
  }, []);

  return (
    <TreeContext.Provider
      value={{
        tree: selectedTree,
        selectTree: (tree) => {
          setSelectedTree(tree);
          localStorage.setItem("tyzo-tree-id", tree?.id ?? "");
        },
        availableTrees: data?.data,
        refetchTrees: refetch,
      }}
    >
      {children}
    </TreeContext.Provider>
  );
}
