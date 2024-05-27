import { ElementContainer } from "../../types";
import { Config } from "../Editor/types";
import { Render as RenderPage } from "../EditorRender";

export function Render({
  config,
  data,
}: {
  config: Config;
  data: ElementContainer;
}) {
  return (
    <RenderPage
      mode="render"
      elementContainer={data}
      elements={data.children}
      element={undefined}
      componentsById={config.components}
    />
  );
}
