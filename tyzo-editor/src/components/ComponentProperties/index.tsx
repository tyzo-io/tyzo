import { PropertyInput } from "../PropertyInput";
import { useComponent } from "../../useComponent";
import { useEditor } from "../Editor/EditorContext";
import { useComponents } from "../../useComponents";
import { useInputs } from "../../useInputs";
import s from './style.module.css'

export function ComponentProperties({ id }: { id: string }) {
  const { elementContainer } = useEditor();
  const element = elementContainer.elements[id];
  const { component } = useComponent(element?.componentId);
  const { components } = useComponents();
  const { inputs } = useInputs();

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
    <div className={s.Props}>
      <h3 className={s.Title}>{component?.name}</h3>
      {Object.values(properties).map((property) => (
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
