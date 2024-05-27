import { useEffect, useMemo, useState } from "react";
import { useBackend } from "./components/EditorBackend";
import { ComponentId, ComponentInfo } from "./types";

export function useComponents() {
  const { backend } = useBackend();

  const [components, setComponents] = useState<
    (ComponentInfo & {
      component: (props?: any) => React.ReactNode;
    })[]
  >([]);
  const [isDoneLoading, setIsDoneLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      const components = await backend.loadComponents();
      setComponents(components);
      setIsDoneLoading(true);
    }
    loadData();
  }, [backend]);

  const componentsById = useMemo(() => {
    return components.reduce(
      (byId, comp) => Object.assign(byId, { [comp.id]: comp }),
      {} as Record<
        ComponentId,
        | ComponentInfo
        // | (ComponentInfo & {
        //     component: (props?: any) => React.JSX.Element;
        //   })
        | undefined
      >
    );
  }, [components]);

  return {
    components,
    componentsById,
    isDoneLoading,
  };
}
