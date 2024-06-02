import { ReactNode } from "react";
import { ComponentInfo, ComponentProperty, PageElement } from "../types";
import { randomId } from "../util/id";

export type ComponentCssProperty = {
  id: string;
  textAlign?: "left" | "center" | "right";
  fontSize?: string;
  fontWeight?: "lighter" | "normal" | "bolder" | "bold";
  margin?: string;
  padding?: string;
  border?: string;
  borderRadius?: string;
  display?: "none" | "block" | "inline" | "inline-block" | "flex";
  flexDirection?: "row" | "column" | "row-reverse" | "column-reverse";
  gap?: string;
  justifyContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-evenly";
  alignItems?: "flex-start" | "flex-end" | "center" | "baseline" | "stretch";
  shadow?: string;
  width?: string;
  height?: string;
  minWidth?: string;
  maxWidth?: string;
  minHeight?: string;
  maxHeight?: string;
  customStyle?: string;
  condition?: {
    breakpoint?: "sm" | "md" | "lg" | "xl" | "2xl";
    onHover?: true;
  };
};

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

export type Breakpoint = keyof typeof breakpoints;

function propToCss(prop: ComponentCssProperty) {
  const subStyle: string[] = [];

  if (prop.fontSize) {
    subStyle.push(`font-size: ${prop.fontSize};`);
  }
  if (prop.textAlign) {
    subStyle.push(`text-align: ${prop.textAlign};`);
  }
  if (prop.fontWeight) {
    subStyle.push(`font-weight: ${prop.fontWeight};`);
  }
  if (prop.display) {
    subStyle.push(`display: ${prop.display};`);
  }
  if (prop.flexDirection) {
    subStyle.push(`flex-direction: ${prop.flexDirection};`);
  }
  if (prop.justifyContent) {
    subStyle.push(`justify-content: ${prop.justifyContent};`);
  }
  if (prop.alignItems) {
    subStyle.push(`align-items: ${prop.alignItems};`);
  }
  if (prop.gap) {
    subStyle.push(`gap: ${prop.gap};`);
  }
  if (prop.margin) {
    subStyle.push(`margin: ${prop.margin};`);
  }
  if (prop.padding) {
    subStyle.push(`padding: ${prop.padding};`);
  }
  if (prop.border) {
    subStyle.push(`border: ${prop.border};`);
  }
  if (prop.borderRadius) {
    subStyle.push(`border-radius: ${prop.borderRadius};`);
  }
  if (prop.shadow) {
    subStyle.push(`box-shadow: ${prop.shadow};`);
  }
  if (prop.width) {
    subStyle.push(`width: ${prop.width};`);
  }
  if (prop.height) {
    subStyle.push(`height: ${prop.height};`);
  }
  if (prop.minWidth) {
    subStyle.push(`min-width: ${prop.minWidth};`);
  }
  if (prop.maxWidth) {
    subStyle.push(`max-width: ${prop.maxWidth};`);
  }
  if (prop.minHeight) {
    subStyle.push(`min-height: ${prop.minHeight};`);
  }
  if (prop.maxHeight) {
    subStyle.push(`max-height: ${prop.maxHeight};`);
  }
  if (prop.customStyle) {
    subStyle.push(prop.customStyle);
  }
  return subStyle.join("\n");
}

export function toCss(
  id: string,
  props: ComponentCssProperty[] | undefined
): string {
  const selector = `.css-${id} > *`;
  const propsWithoutCondition = props?.filter((prop) => !prop.condition) ?? [];
  const cssPropsWithoutCondition = propsWithoutCondition.map((prop) =>
    propToCss(prop)
  );

  const styleParts: string[] = [];
  if (cssPropsWithoutCondition.length) {
    styleParts.push(`${selector} { ${cssPropsWithoutCondition.join("\n")} }`);
  }
  styleParts.push(`.css-${id} > style { display: none; }`);

  const propsWithCondition = props?.filter((prop) => prop.condition) ?? [];
  // todo could be grouped if the condition is the same
  for (const prop of propsWithCondition) {
    if (prop.condition?.breakpoint) {
      styleParts.push(
        `@media (min-width: ${breakpoints[prop.condition.breakpoint]}) {
  ${selector} {
    ${propToCss(prop)}
  } 
}`
      );
    }
  }

  return styleParts.join("\n\n");
}

const cssProperty: ComponentProperty = {
  name: "css",
  type: "css",
  defaultData: [],
};

export function CssContainer(props: {
  tyzo: PageElement;
  css: ComponentCssProperty[];
  children: ReactNode;
}) {
  const { css, tyzo } = props;

  return (
    <div className={`css-${tyzo.id}`}>
      <style dangerouslySetInnerHTML={{ __html: toCss(tyzo.id, css) }}></style>
      {props.children}
    </div>
  );
}

export function withCss<T extends ComponentInfo>(
  component: T,
  defaultCssProps?: Omit<ComponentCssProperty, "id">[]
): T {
  return {
    ...component,
    properties: {
      ...component.properties,
      css: {
        ...cssProperty,
        defaultData: defaultCssProps?.map((p) => ({
          ...p,
          id: randomId(),
        })),
        // ...component.defaultProps,
      },
    },
    component: (props: { tyzo: PageElement; css: ComponentCssProperty[] }) => {
      const { css, ...rest } = props;
      const Comp = component.component;

      return (
        <CssContainer css={css} tyzo={rest.tyzo}>
          <Comp {...rest} />
        </CssContainer>
      );
    },
  };
}
