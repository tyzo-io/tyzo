import Input from "../Input";
import s from "./PropertyInput.module.css";
import {
  ComponentInfo,
  ComponentProperty,
  ElementContainer,
  InputMap,
  PageElement,
  TemplateProperty,
} from "../../types";
import { useState } from "react";
import { Button } from "../Button";
import { randomId } from "../../util/id";
import { useEditor } from "../Editor/EditorContext";
import { useTranslations } from "../../i18n";

function PropertyTile({ property }: { property: ComponentProperty }) {
  return (
    <div className={s.labels}>
      <label className={s.code}>{property.name}</label>
    </div>
  );
}

export function PropertyInput({
  property,
  element,
  elementContainer,
  components,
  inputs,
  value,
  setValue,
  cardHeader,
}: {
  property: ComponentProperty;
  element: PageElement;
  elementContainer: ElementContainer;
  components: ComponentInfo[];
  inputs: InputMap;
  value: any;
  setValue: (value: any) => void;
  cardHeader?: {
    title: string;
    buttons?: React.ReactNode;
  };
}) {
  const Input = inputs[property.type];
  if (!Input) {
    return null;
  }
  return (
    <div>
      <Input
        property={property}
        value={value}
        setValue={setValue}
        element={element}
        elementContainer={elementContainer}
        components={components}
        inputs={inputs}
        {...{
          cardHeader,
        }}
      />
    </div>
  );
}

export function DefaultStringInput({
  value,
  setValue,
  property,
  cardHeader,
}: {
  value: string | { html: string; engine: "lexical.dev"; blocks: any };
  setValue: (
    value:
      | string
      | { html: string; engine: "lexical.dev"; blocks: any }
      | undefined
  ) => void;
  property: ComponentProperty;
  cardHeader?: {
    title: string;
    buttons?: React.ReactNode;
  };
}) {
  if (
    property.type === "string" &&
    "editor" in property &&
    property.editor === "richText"
  ) {
    // This doesn't work since it's a yjs proxy object :(
    // const safeValue =
    //   typeof value === "object" && typeof value.blocks === "object"
    //     ? value.blocks
    //     : undefined;

    // const blocks = (value as any)?.blocks;
    // const safeValue = blocks ? JSON.parse(JSON.stringify(blocks)) : blocks; // convert from YJS proxy objec
    // const safeHtml = (value as any)?.html;

    return (
      <div className={s.field}>
        <div className={s.fieldTitle}>
          <PropertyTile property={property} />
          {cardHeader?.buttons}
        </div>
        {/* <BlockNoteEditor
          initialValue={safeValue}
          initialHtml={safeHtml}
          onChange={(state, html) => {
            setValue({
              html,
              engine: "lexical.dev",
              blocks: state,
            });
          }}
        /> */}
        {/* <EditorJsEditor
          initialValue={safeValue}
          initialHtml={safeHtml}
          onChange={(state, html) => {
            setValue({
              html,
              engine: "lexical.dev",
              blocks: JSON.parse(JSON.stringify(state)), // If we don't do this, YJS throws an error
            });
          }}
        /> */}
        {/* <LexicalEditor
          initialValue={safeValue}
          initialHtml={safeHtml}
          onChange={(state, html) => {
            setValue({
              html,
              engine: "lexical.dev",
              blocks: state.toJSON(),
            });
          }}
        /> */}
      </div>
    );
  }
  if ("enum" in property && property.enum) {
    const safeValue =
      typeof value === "string" && property.enum.includes(value)
        ? value
        : undefined;
    return (
      <div className={s.field}>
        <div className={s.fieldTitle}>
          <PropertyTile property={property} />
          {cardHeader?.buttons}
        </div>
        <select
          value={safeValue}
          onChange={(e) => {
            if (e.target.value === "undefined") {
              setValue(undefined);
            }
            if (property.enum?.includes(e.target.value)) {
              setValue(e.target.value);
            }
          }}
        >
          <option value={"undefined"}> - </option>
          {property.enum.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
    );
  }
  const safeValue = typeof value === "string" ? value : "";
  return (
    <div className={s.field}>
      <div className={s.fieldTitle}>
        <PropertyTile property={property} />
        {cardHeader?.buttons}
      </div>
      <Input
        type="string"
        value={safeValue}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      />
    </div>
  );
}

// export function DefaultRichTextInput({
//   value,
//   setValue,
//   property,
// }: {
//   value: { html: string; engine?: "lexical.dev"; blocks?: any };
//   setValue: (
//     value: string | { html: string; engine: "lexical.dev"; blocks: any }
//   ) => void;
//   property: ComponentProperty;
// }) {
//   const safeValue =
//     typeof value === "object" && typeof value.blocks === "object"
//       ? value.blocks
//       : undefined;

//   return <div className={s.field}>
//     <PropertyTile property={property} />
//     <EditorJsEditor
//       initialValue={safeValue}
//       initialHtml={value.html}
//       onChange={(state, html) => {
//         setValue({
//           html,
//           engine: "lexical.dev",
//           blocks: state,
//         });
//       }}
//     />
//   </div>;
// }

export function DefaultNumberInput({
  value,
  setValue,
  property,
  cardHeader,
}: {
  value: number;
  setValue: (value: number) => void;
  property: ComponentProperty;
  cardHeader?: {
    title: string;
    buttons?: React.ReactNode;
  };
}) {
  return (
    <div className={s.field}>
      <div className={s.fieldTitle}>
        <PropertyTile property={property} />
        {cardHeader?.buttons}
      </div>
      <Input
        type="number"
        value={value}
        onChange={(e) => {
          const newValue = Number(e.target.value);
          if (!isNaN(newValue)) {
            setValue(newValue);
          }
        }}
      />
    </div>
  );
}

export function DefaultBooleanInput({
  value,
  setValue,
  property,
  cardHeader,
}: {
  value: boolean;
  setValue: (value: boolean) => void;
  property: ComponentProperty;
  cardHeader?: {
    title: string;
    buttons?: React.ReactNode;
  };
}) {
  return (
    <div className={s.field}>
      <div className={s.fieldTitle}>
        <PropertyTile property={property} />
        {cardHeader?.buttons}
      </div>
      <Input
        type="checkbox"
        checked={value}
        onChange={(e) => {
          const newValue = e.target.checked;
          setValue(newValue);
        }}
      />
    </div>
  );
}

export function DefaultObjectInput({
  element,
  elementContainer,
  components,
  inputs,
  value,
  setValue,
  property,
  cardHeader,
}: {
  element: PageElement;
  elementContainer: ElementContainer;
  components: ComponentInfo[];
  inputs: InputMap;
  value: Record<string, any>;
  setValue: (value: Record<string, any>) => void;
  property: ComponentProperty;
  cardHeader?: {
    title: string;
    buttons?: React.ReactNode;
  };
}) {
  const [isExapnded, setIsExpanded] = useState(false);
  if (!("fields" in property)) {
    return null;
  }
  return (
    <div className={s.object}>
      {/* <div className={s.field}>
        <PropertyTile property={property} />
      </div> */}
      {cardHeader && (
        <div
          className={[s.objectHeader, isExapnded && s.expandedObject]
            .filter(Boolean)
            .join(" ")}
        >
          <button
            className={s.cardHeaderTitle}
            onClick={() => {
              setIsExpanded(!isExapnded);
            }}
          >
            {cardHeader.title}
          </button>
          <span className={s.cardHeaderButtons}>{cardHeader.buttons}</span>
        </div>
      )}
      {(isExapnded || !cardHeader) && (
        <div className={s.objectBody}>
          {Object.values(property.fields ?? {}).map((property) => (
            <PropertyInput
              key={property.name}
              element={element}
              elementContainer={elementContainer}
              components={components}
              inputs={inputs}
              property={property}
              value={value?.[property.name]}
              setValue={(propertyValue) => {
                if (value) {
                  value[property.name] = propertyValue;
                } else {
                  setValue({
                    [property.name]: propertyValue,
                  });
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function DefaultArrayInput({
  element,
  elementContainer,
  components,
  inputs,
  value,
  setValue,
  property,
}: {
  element: PageElement;
  elementContainer: ElementContainer;
  components: ComponentInfo[];
  inputs: InputMap;
  value: any[] | undefined;
  setValue: (value: any[]) => void;
  property: ComponentProperty;
}) {
  if (!("items" in property)) {
    return null;
  }
  return (
    <div className={s.field}>
      <div className={s.arrayTitle}>
        <PropertyTile property={property} />
      </div>
      <div className={s.arrayItems}>
        {Array.isArray(value) &&
          value.map((item, i) => (
            <div>
              <PropertyInput
                element={element}
                elementContainer={elementContainer}
                components={components}
                inputs={inputs}
                property={property.items}
                value={item}
                setValue={(itemValue) => {
                  const newValue = [...(value ?? [])];
                  newValue[i] = itemValue;
                  setValue(newValue);
                }}
                cardHeader={{
                  title: `Item ${i + 1}`,
                  buttons: (
                    <button
                      onClick={() => {
                        value?.splice(i, 1);
                      }}
                      className={s.button}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6.2253 4.81108C5.83477 4.42056 5.20161 4.42056 4.81108 4.81108C4.42056 5.20161 4.42056 5.83477 4.81108 6.2253L10.5858 12L4.81114 17.7747C4.42062 18.1652 4.42062 18.7984 4.81114 19.1889C5.20167 19.5794 5.83483 19.5794 6.22535 19.1889L12 13.4142L17.7747 19.1889C18.1652 19.5794 18.7984 19.5794 19.1889 19.1889C19.5794 18.7984 19.5794 18.1652 19.1889 17.7747L13.4142 12L19.189 6.2253C19.5795 5.83477 19.5795 5.20161 19.189 4.81108C18.7985 4.42056 18.1653 4.42056 17.7748 4.81108L12 10.5858L6.2253 4.81108Z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                  ),
                }}
              />
            </div>
          ))}
        <button
          className={s.button}
          onClick={() => {
            let copy = property.defaultItem;
            if (Array.isArray(property.defaultItem)) {
              copy = [...property.defaultItem];
            } else if (typeof property.defaultItem === "object") {
              copy = { ...property.defaultItem };
            }
            if (value) {
              value.push(copy);
            } else {
              setValue([copy]);
            }
          }}
        >
          Add Item
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 4C11.4477 4 11 4.44772 11 5V11H5C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11H13V5C13 4.44772 12.5523 4 12 4Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function DefaultChildrenInput() {
  // {
  // element,
  // elementContainer,
  // components,
  // inputs,
  // property,
  // }: {
  //   value: number;
  //   setValue: (value: number) => void;
  //   element: PageElement;
  //   elementContainer: ElementContainer;
  //   components: ComponentInfo[];
  //   inputs: InputMap;
  //   property: ComponentProperty;
  // }
  return <></>;
  // return (
  //   <div>
  //     <div className={s.field}>
  //       <PropertyTile property={property} />
  //     </div>
  //     <div>
  //       {element.children?.map((childId) => {
  //         const child = elementContainer.elements?.[childId];
  //         if (!child) {
  //           return null;
  //         }
  //         return (
  //           <div className={s.treeDeeper}>
  //             <ElementTreeItem
  //               key={childId}
  //               element={child}
  //               elementContainer={elementContainer}
  //               components={components}
  //             >
  //               <ComponentProperties
  //                 id={childId}
  //                 elementContainer={elementContainer}
  //                 components={components}
  //                 inputs={inputs}
  //               />
  //             </ElementTreeItem>
  //           </div>
  //         );
  //       })}
  //     </div>
  //   </div>
  // );
}

export function ComponentProperties({
  id,
  elementContainer,
  components,
  inputs,
}: {
  id: string;
  elementContainer: ElementContainer;
  components: ComponentInfo[];
  inputs: InputMap;
}) {
  const element = elementContainer.elements?.[id];
  const component = components.find(
    (component) => component.id === element?.componentId
  );

  if (!element) {
    return null;
  }

  const properties = element.componentId.startsWith("global:")
    ? { children: { type: "children", name: "children", defaultData: [] } }
    : component?.properties;

  if (!properties) {
    return null;
  }

  return (
    <div>
      {Object.values(properties ?? {}).map((property) => (
        <PropertyInput
          key={property.name}
          element={element}
          elementContainer={elementContainer}
          components={components}
          inputs={inputs}
          property={property}
          value={element.data?.[property.name]}
          setValue={(value) => {
            if (!element.data) {
              element.data = {};
            }
            element.data[property.name] = value;
          }}
        />
      ))}
    </div>
  );
}

// export function DefaultStyleInput({
//   // value,
//   // setValue,
//   property,
// }: {
//   value: CSSProperties;
//   setValue: (value: CSSProperties) => void;
//   property: { name: string };
// }) {
//   return (
//     <div className={s.field}>
//       <label>{capitalize(property.name)}</label>
//       <label className={s.code}>{property.name}</label>
//       Coming Soon!
//     </div>
//   );
// }

// export function DefaultClassesInput({
//   value,
//   setValue,
//   property,
// }: {
//   value: {
//     className: string;
//     properties: CSSProperties;
//   }[];
//   setValue: (
//     value: {
//       className: string;
//       properties: CSSProperties;
//     }[]
//   ) => void;
//   property: { name: string };
// }) {
//   return (
//     <div className={s.field}>
//       <label>{capitalize(property.name)}</label>
//       <label className={s.code}>{property.name}</label>
//       Coming Soon!
//     </div>
//   );
// }

export function DefaultTemplateInput({
  element,
  value,
  setValue,
  property,
  cardHeader,
}: {
  element: PageElement;
  value: ElementContainer;
  setValue: (value: ElementContainer) => void;
  property: TemplateProperty;
  cardHeader?: {
    title: string;
    buttons?: React.ReactNode;
  };
}) {
  const { translations } = useTranslations();
  const { setEditTemplate } = useEditor();
  // const [shouldEdit, setShouldEdit] = useState(false)
  // useEffect(() => {
  //   if (shouldEdit && elementContainer.id !== value?.id && value) {
  //     setElementContainer(value);
  //   }
  // }, [shouldEdit, value, value?.id, elementContainer.id, setElementContainer]);
  return (
    <div className={s.field}>
      <div className={s.fieldTitle}>
        <PropertyTile property={property} />
        {cardHeader?.buttons}
      </div>
      <Button
        variant="outline"
        onClick={() => {
          // setShouldEdit(true);
          if (!value) {
            const container = {
              id: randomId(),
              children: [],
              elements: {},
            };
            setValue(container);
          }

          setEditTemplate({
            element,
            property: property,
          });

          // Why not just set the container here?
          // setElementContainer(container);
          // Because we're using yjs and relying on proxy objects. We need to use the proxy object in setElementContainer.
          // But when we create the new container, it's not a proxy object yet, it's a plain object
          // So we do the workaround with `useEffect` to make sure we actually use the proxy object
        }}
      >
        {translations.editTemplate}
      </Button>
    </div>
  );
}
