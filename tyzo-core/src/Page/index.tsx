import type { Config, ElementContainer } from "@tyzo/page-editor";
import { Render } from "@tyzo/page-editor/render";

export function Page({
  data,
  components,
  config,
}: {
  data: ElementContainer;
  components: Record<string, any>;
  config?: Partial<Config>;
}) {
  return (
    <Render
      config={{
        components,
        ...config,
      }}
      data={data}
    />
  );
}
