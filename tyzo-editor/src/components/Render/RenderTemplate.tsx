import { Render } from "./Render";
import { RenderProps } from "./types";

export type TemplateData = RenderProps;

export function RenderTemplate<T extends Record<string, any>>({
  template,
  props,
}: {
  template: TemplateData | undefined;
  props: T;
}) {
  if (!template) {
    return null;
  }
  return <Render {...template} props={props} />;
}
