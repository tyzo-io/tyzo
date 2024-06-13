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
  const stackId = `${id}-stack`;
  return (
    <CssContainer
      css={[
        {
          ...baseRule,
          id: stackId,
        },
        ...(additionalRules?.map((rule) => ({
          ...rule,
          id: stackId,
        })) ?? []),
      ]}
      tyzo={{ id: stackId, componentId: "stack" }}
    >
      <div>{children}</div>
    </CssContainer>
  );
}
