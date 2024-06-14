import type { ElementContainer } from "../../types";
import type { Config } from "../Editor/types";
import { Render as RenderPage } from "./Render";

export function Render({
  config,
  data,
  contextData,
}: {
  config: Config;
  data: ElementContainer;
  contextData?: Record<string, any>;
}) {
  return (
    <RenderPage
      elementContainer={data}
      elements={data.children}
      componentsById={config.components}
      isEditMode={false}
      props={contextData ?? {}}
      tepmlateFunction={config.tepmlateFunction}
    />
  );
}
