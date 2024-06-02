import type { ElementContainer } from "@tyzo/page-editor";
import { Render } from "@tyzo/page-editor/render";

export function Page({
  data,
  components,
}: {
  data: ElementContainer;
  components: Record<string, any>;
}) {
  return (
    <Render
      config={{
        components,
      }}
      data={data}
    />
  );
}
