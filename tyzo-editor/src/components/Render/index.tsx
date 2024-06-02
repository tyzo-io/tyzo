import type { ElementContainer } from "../../types";
import type { Config } from "../Editor/types";
import { Render as RenderPage } from "./Render";

export function Render({
  config,
  data,
}: {
  config: Config;
  data: ElementContainer;
}) {
  return (
    <RenderPage
      elementContainer={data}
      elements={data.children}
      componentsById={config.components}
    />
  );
}
