import { useEffect, useMemo, useState } from "react";
import { useBackend } from "../EditorBackend";
import s from "./ComponentsList.module.css";
import { useComponents } from "../../useComponents";
import { addNewElement } from "../../operations";
import { useEditor } from "../Editor/EditorContext";
import { ComponentGroup, ElementContainer } from "../../types";
import { useTranslations } from "../../i18n";
// import * as HoverCard from '@radix-ui/react-hover-card';

// class ErrorBoundary extends React.Component<{ fallback: React.ReactNode, children: React.ReactNode }, { hasError: boolean }> {
//   constructor(props: any) {
//     super(props);
//     this.state = { hasError: false };
//   }

//   static getDerivedStateFromError() {
//     // Update state so the next render will show the fallback UI.
//     return { hasError: true };
//   }

//   componentDidCatch() {
//     // Example "componentStack":
//     //   in ComponentThatThrows (created by App)
//     //   in ErrorBoundary (created by App)
//     //   in div (created by App)
//     //   in App
//     // logErrorToMyService(error, info.componentStack);
//   }

//   render() {
//     if (this.state.hasError) {
//       // You can render any custom fallback UI
//       return this.props.fallback;
//     }

//     return this.props.children;
//   }
// }

// function Icon({ fn }: { fn: (() => React.JSX.Element) | undefined }) {
//   if (!fn) {
//     return null;
//   }
//   const Comp = fn;
//   return <Comp />;
// }

function LibraryComponentGroup({
  group,
  elementContainer,
  availableComponentIds,
}: {
  group: ComponentGroup;
  elementContainer: ElementContainer;
  availableComponentIds?: string[];
}) {
  const { components } = useComponents();
  const groupComponents = useMemo(
    () =>
      components.filter(
        (component) =>
          component.groupName === group.name &&
          (!availableComponentIds ||
            availableComponentIds.includes(component.id))
      ),
    [availableComponentIds, components, group]
  );
  const { setIsDragging } = useEditor();
  return (
    <ul className={s.itemContainer}>
      {groupComponents.map((comp) => (
        <li
          key={comp.id}
          draggable
          onClick={() => {
            addNewElement(elementContainer, comp);
          }}
          onDragStart={(e) => {
            setIsDragging(true);
            e.dataTransfer.setData("tyzo/component-id", comp.id);
          }}
          onDragEnd={() => {
            setIsDragging(false);
          }}
        >
          <span className={s.libraryItem}>{comp.name}</span>
          {/* <Icon fn={comp.Editor?.icon} /> */}
          {/* <HoverCard.Root openDelay={100}>
            <HoverCard.Trigger>
              <span className={s.libraryItem}>{comp.name}</span>
            </HoverCard.Trigger>
            <HoverCard.Portal>
              <HoverCard.Content
                side="right"
                className="max-h-[400px]"
              >
                <HoverCard.Arrow />
                <ErrorBoundary fallback={<></>}>
                  <div className="bg-white p-2 shadow rounded-sm overflow-y-auto">
                    <Render
                      elementContainer={{
                        elements: {
                          c: {
                            id: "c",
                            componentId: comp.id,
                            data: Object.values(comp.properties ?? {}).reduce(
                              (all, prop) =>
                                Object.assign(all, {
                                  [prop.name]:
                                    "defaultData" in prop
                                      ? prop.defaultData
                                      : undefined,
                                }),
                              {}
                            ),
                          },
                        },
                        children: ["c"],
                      }}
                      elements={["c"]}
                      componentsById={{
                        [comp.id]: comp,
                      }}
                    />
                  </div>
                </ErrorBoundary>
              </HoverCard.Content>
            </HoverCard.Portal>
          </HoverCard.Root> */}
        </li>
      ))}
    </ul>
  );
}

export function ComponentsList({
  elementContainer,
  availableComponentIds,
}: {
  elementContainer: ElementContainer;
  availableComponentIds?: string[];
}) {
  const { backend } = useBackend();
  const { translations} = useTranslations()

  const [componentGroups, setGroups] = useState<ComponentGroup[]>([]);
  const { componentsById } = useComponents();
  useEffect(() => {
    backend.loadComponentGroups().then((group) => setGroups(group));
  }, [backend]);

  const availableGroups = useMemo(() => {
    if (!availableComponentIds) {
      return componentGroups;
    }

    if (!componentsById) {
      return [];
    }

    const groupNames = availableComponentIds.map(
      (id) => componentsById[id]?.groupName
    );

    const groups = componentGroups.filter((group) =>
      groupNames.includes(group.name)
    );
    return groups;
  }, [componentsById, availableComponentIds, componentGroups]);

  return (
    <>
      <p style={{ margin: "0.5em", fontWeight: "bold" }}>
        {translations.components}
      </p>
      <ul className={s.addElementGroup}>
        {availableGroups.map((group) => (
          <li key={group.name}>
            <div className={s.groupTitle}>{group.name}</div>
            <LibraryComponentGroup
              group={group}
              elementContainer={elementContainer}
              availableComponentIds={availableComponentIds}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
