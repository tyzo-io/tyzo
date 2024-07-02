import { createContext, useContext, useMemo, useState } from "react";
import type { Tree, TyzoConfig } from "@/tyzo-service/config";
import serviceClientConfig from "@/serviceClient";
import { useData } from "@/lib/useData";
import { ComponentInfo, Config } from "@tyzo/page-editor";

const ConfigContext = createContext<
  TyzoConfig & { components: Record<string, ComponentInfo> }
>({} as TyzoConfig & { components: Record<string, ComponentInfo> });

export function useConfig() {
  return useContext(ConfigContext);
}

export function ConfigProvider({
  spaceId,
  children,
  components,
  config: configFromProps,
  serviceConfig,
}: {
  spaceId: string | null | undefined;
  children: React.ReactNode;
  components: Record<string, ComponentInfo>;
  config?: Partial<Config>;
  serviceConfig?: {
    backendUrl?: string;
    anonKey?: string;
  };
}) {
  const config = useMemo(() => {
    if (!spaceId) {
      return null;
    }
    const config = serviceClientConfig({ ...serviceConfig, spaceId });
    return { ...config, ...configFromProps };
  }, [spaceId, configFromProps, serviceConfig]);

  if (!config) {
    return <div>No space id passed in your config</div>;
  }

  return (
    <ConfigContext.Provider value={{ ...config, components }}>
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

export function TreeProvider({
  children,
  treeId,
}: {
  children: React.ReactNode;
  treeId?: string;
}) {
  const config = useConfig();
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);

  const { data, refetch } = useData(async () => {
    const trees = await config.trees.list();
    if (treeId) {
      const tree = trees.data.find((tree) => tree.id === treeId);
      if (tree) {
        setSelectedTree(tree);
        return trees;
      }
    }
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
