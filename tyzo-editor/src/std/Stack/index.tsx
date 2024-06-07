import { ComponentCssProperty, CssContainer } from "../../CssProps";

export function Stack({
  id,
  baseRule,
  additionalRules,
  children,
}: {
  id: string;
  baseRule: ComponentCssProperty | undefined;
  additionalRules: ComponentCssProperty[] | undefined;
  children: React.ReactNode;
}) {
  return (
    <CssContainer
      css={[
        {
          display: "flex",
          ...baseRule,
          id,
        },
        ...(additionalRules?.map((rule) => ({ ...rule, id })) ?? []),
      ]}
      tyzo={{ id, componentId: "stack" }}
    >
      {children}
    </CssContainer>
  );
}
