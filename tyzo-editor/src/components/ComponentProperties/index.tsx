import { PropertyInput } from "../PropertyInput";
import { useComponent } from "../../useComponent";
import { useEditor } from "../Editor/EditorContext";
import { useComponents } from "../../useComponents";
import { useInputs } from "../../useInputs";

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
    <div>
      {Object.values(properties).map((property) => (
        <PropertyInput
          key={property.name}
          element={element}
          elementContainer={elementContainer}
          components={components}
          inputs={inputs}
          property={property}
          value={
            element.data?.[property.name] ??
            ("defaultData" in property ? property.defaultData : undefined)
          }
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
