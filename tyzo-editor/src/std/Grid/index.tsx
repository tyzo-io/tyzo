import { ComponentCssProperty, CssContainer } from "../../CssProps";

export function Grid({
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
  const gridId = `${id}-grid`;
  return (
    <CssContainer
      css={[
        {
          ...baseRule,
          id: gridId,
        },
        ...(additionalRules?.map((rule) => ({
          ...rule,
          id: gridId,
        })) ?? []),
      ]}
      tyzo={{ id: gridId, componentId: "grid" }}
    >
      <div>{children}</div>
    </CssContainer>
  );
}
