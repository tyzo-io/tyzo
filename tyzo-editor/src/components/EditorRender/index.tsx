import { DropZone } from "../DropZone";
import s from "./Render.module.css";
import type {
  ComponentInfo,
  // ComponentProperty,
  ElementContainer,
  PageElementId,
  // StringProperty,
} from "../../types";
import { Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Render as PageRender } from "../Render/Render";
import { useTranslations } from "../../i18n";

// function getComponent(
//   componentId: string,
//   componentsById: Record<
//     string,
//     | (ComponentInfo & {
//         component: (props?: any) => React.ReactNode;
//       })
//     | undefined
//   >
// ) {
//   if (componentId.startsWith("global:")) {
//     return {
//       Comp: componentId,
//       properties: {
//         children: { type: "children", name: "children", defaultData: [] },
//       } as Record<string, ComponentProperty>,
//     };
//   }
//   const component = componentsById[componentId];
//   const Comp = component?.component;
//   return {
//     Comp,
//     component,
//     properties: component?.properties ?? {},
//   };
// }

// function visitPropertyDeep(
//   property: ComponentProperty,
//   data: any,
//   callback: (
//     prop: ComponentProperty,
//     parentData: any,
//     key: string | number
//   ) => void,
//   parentData?: any,
//   key?: string | number
// ) {
//   if (parentData && key) {
//     callback(property, parentData, key);
//   }

//   if (property.type === "object" && "fields" in property) {
//     for (const subProp of Object.values(property.fields)) {
//       visitPropertyDeep(
//         subProp,
//         data?.[subProp.name],
//         callback,
//         data,
//         subProp.name
//       );
//     }
//   }
//   if (property.type === "array" && "items" in property) {
//     for (const i in data ?? []) {
//       const item = data[i];
//       visitPropertyDeep(property.items, item, callback, data, i);
//     }
//   }
// }

function HackTyzoIdAttribute({ id }: { id: string }) {
  const [didHack, setDidHack] = useState(false);
  return (
    // This only works for single element components
    <Fragment>
      {!didHack && (
        <div
          ref={(el) => {
            if (
              el?.nextSibling &&
              !didHack &&
              !(el.nextSibling as HTMLElement).getAttribute("data-tyzo-id")
            ) {
              (el.nextSibling as HTMLElement).setAttribute("data-tyzo-id", id);
              setDidHack(true);
            }
          }}
          dangerouslySetInnerHTML={{
            __html: `<!-- data-tyzo-id="${id}" -->`,
          }}
        ></div>
      )}
    </Fragment>
  );
}

// export function RenderOld({
//   elementContainer,
//   // element,
//   elements,
//   mode,
//   componentsById,
//   isDragging,
// }: {
//   elementContainer: ElementContainer;
//   element: PageElementId | undefined;
//   elements: PageElementId[];
//   componentsById: Record<string, ComponentInfo | undefined>;
//   mode: "edit" | "render";
//   isDragging?: boolean;
// }) {
//   return (
//     <>
//       {elements.map((elId) => {
//         const el = elementContainer.elements[elId];
//         if (!el) {
//           return null;
//         }
//         const { Comp, component, properties } = getComponent(
//           el.componentId,
//           componentsById
//         );
//         if (!Comp) {
//           return null;
//         }
//         const textData: Record<string, string> = {};
//         const childrenData: Record<string, React.JSX.Element> = {};
//         const overriddenData = el.data
//           ? JSON.parse(JSON.stringify(el.data)) // This is a proxy object since we're usig yjs, structuredClone doesn't work :(
//           : {};
//         for (const key of Object.keys(properties)) {
//           if (properties[key].type === "children") {
//             childrenData[key] = (
//               <>
//                 {mode === "edit" && (el.children?.length ?? 0) === 0 && (
//                   <div className={s.emptyContainer}>
//                     This {component?.name ?? el.componentId} is empty
//                   </div>
//                 )}
//                 <Render
//                   elementContainer={elementContainer}
//                   element={elId}
//                   elements={el.children ?? []}
//                   mode={mode}
//                   componentsById={componentsById}
//                 />
//                 {mode === "edit" && isDragging && (
//                   <DropZone
//                     label={component?.name}
//                     elementContainer={elementContainer}
//                     parentId={elId}
//                   />
//                 )}
//               </>
//             );
//           }
//           visitPropertyDeep(
//             properties[key],
//             overriddenData?.[key],
//             (property, parentData, key) => {
//               if (
//                 property.type === "richText" ||
//                 (property.type === "string" &&
//                   "editor" in property &&
//                   (property as StringProperty).editor === "richText" &&
//                   parentData?.[key])
//               ) {
//                 parentData[key] = (
//                   <div
//                     dangerouslySetInnerHTML={{
//                       __html: parentData?.[key].html ?? "",
//                     }}
//                   ></div>
//                 );
//               }
//             },
//             overriddenData,
//             key
//           );
//           // if (component.properties?.[key].type === "string") {
//           //   // do interpolation with `data`
//           //   const template = el.data[key] ?? "";
//           //   textData[key] = templateString(template, data);
//           // }
//         }
//         return (
//           <Fragment key={el.id}>
//             {mode === "edit" && <HackTyzoIdAttribute id={el.id} />}
//             <Comp
//               {...overriddenData}
//               {...textData}
//               {...childrenData}
//               tyzo={el}
//             />
//           </Fragment>
//         );
//       })}
//     </>
//   );
// }


export function Render({
  elementContainer,
  // element,
  elements,
  // mode,
  componentsById,
  isDragging,
}: {
  elementContainer: ElementContainer;
  element: PageElementId | undefined;
  elements: PageElementId[];
  componentsById: Record<string, ComponentInfo | undefined>;
  // mode: "edit" | "render";
  isDragging?: boolean;
}) {
  const { translations } = useTranslations();
  return (
    <PageRender
      elementContainer={elementContainer}
      elements={elements}
      componentsById={componentsById}
      isEditMode={true}
      preElement={(el) => <HackTyzoIdAttribute id={el.id} />}
      preChildElement={(el) =>
        (el.children?.length ?? 0) === 0 && (
          <div className={s.emptyContainer}>
            {translations.containerEmpty.replace(
              "{{}}",
              componentsById[el.componentId]?.name ?? el.componentId
            )}
          </div>
        )
      }
      afterChildElement={(el) => {
        if (isDragging) {
          return (
            <DropZone
              label={componentsById[el.componentId]?.name}
              elementContainer={elementContainer}
              parentId={el.id}
            />
          );
        }
        return null;
      }}
    />
  );
}