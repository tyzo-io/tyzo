import { Render, type ElementContainer } from "@tyzo/page-editor";
import { editorConfig } from "../Editor/Editor";

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
        ...editorConfig,
        components: {
          ...editorConfig.components,
          ...components,
        },
      }}
      data={data}
    />
  );
}
