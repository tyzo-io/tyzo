import { Render, type Data } from "@measured/puck";
import { editorConfig } from "../Editor/Editor";
import "../globals.css";

export function Page({
  data,
  components,
}: {
  data: Data;
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
