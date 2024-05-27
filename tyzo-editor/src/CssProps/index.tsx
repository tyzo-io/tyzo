import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuItem,
  DropdownMenuSub,
} from "../components/Dropdown";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/Select";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowRightFromLine,
  ArrowRightToLine,
  Bold,
  CopySlash,
  MoreVertical,
  Plus,
  Ruler,
  Square,
  Squircle,
  Trash,
  Type,
} from "lucide-react";
import {
  ComponentInfo,
  ComponentProperty,
  EditorInput,
  ElementContainer,
  InputMap,
  PageElement,
} from "../types";
import Input from "../components/Input";
import Label from "../components/Label";
import s from "./CssProps.module.css";
import { randomId } from "../util/id";

type ComponentCssProperty = {
  id: string;
  textAlign?: "left" | "center" | "right";
  fontSize?: string;
  fontWeight?: "lighter" | "normal" | "bolder" | "bold";
  margin?: string;
  padding?: string;
  border?: string;
  borderRadius?: string;
  condition?: {
    breakpoint?: "sm" | "md" | "lg" | "xl" | "2xl";
    onHover?: true;
  };
};

const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

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
  return subStyle.join("\n");
}

function toCss(id: string, props: ComponentCssProperty[] | undefined): string {
  const selector = `.css-${id} > *`;
  const propsWithoutCondition = props?.filter((prop) => !prop.condition) ?? [];
  const cssPropsWithoutCondition = propsWithoutCondition.map((prop) =>
    propToCss(prop)
  );

  const styleParts: string[] = [];
  if (cssPropsWithoutCondition.length) {
    styleParts.push(`${selector} { ${cssPropsWithoutCondition.join("\n")} }`);
  }

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

export const CssEdit: EditorInput<{
  property: ComponentProperty;
  element: PageElement;
  elementContainer: ElementContainer;
  components: ComponentInfo[];
  inputs: InputMap;
  value: ComponentCssProperty[] | undefined;
  setValue: (value: ComponentCssProperty[]) => void;
}> = function CssEdit(props) {
  const cssProps: ComponentCssProperty[] = props.value ?? [];
  const addProp = (value: Omit<ComponentCssProperty, "id">) => {
    if (props.value) {
      props.value.push({
        id: randomId(),
        ...value,
      });
    } else {
      props.setValue([
        {
          id: randomId(),
          ...value,
        },
      ]);
    }
  };
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className={s.Margin}>
          <Plus />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Text</DropdownMenuLabel>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Type className={s.Icon} />
              <span>Font Size</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onSelect={() => {
                    addProp({ fontSize: "0.8rem" });
                  }}
                >
                  <Type className={s.SmallIcon} /> Small
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    addProp({ fontSize: "1rem" });
                  }}
                >
                  <Type className={s.Icon} /> Medium
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    addProp({ fontSize: "2rem" });
                  }}
                >
                  <Type className={s.BigIcon} /> Large
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <AlignLeft className={s.Icon} />
              <span>Text Align</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onSelect={() => {
                    addProp({ textAlign: "left" });
                  }}
                >
                  <AlignLeft className={s.Icon} /> Left
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    addProp({ textAlign: "center" });
                  }}
                >
                  <AlignCenter className={s.Icon} />
                  Center
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    addProp({ textAlign: "right" });
                  }}
                >
                  <AlignRight className={s.Icon} />
                  Right
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Bold className={s.Icon} />
              <span>Font Weight</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onSelect={() => {
                    addProp({ fontWeight: "lighter" });
                  }}
                >
                  <Bold className={s.Icon} strokeWidth={2} /> Lighter
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    addProp({ fontWeight: "normal" });
                  }}
                >
                  <Bold className={s.Icon} strokeWidth={3} /> Normal
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    addProp({ fontWeight: "bolder" });
                  }}
                >
                  <Bold className={s.Icon} strokeWidth={4} /> Bolder
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    addProp({ fontWeight: "bold" });
                  }}
                >
                  <Bold className={s.Icon} strokeWidth={5} /> Bold
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Layout</DropdownMenuLabel>

          <DropdownMenuItem
            onSelect={() => {
              addProp({ margin: "1em" });
            }}
          >
            <ArrowRightFromLine className={s.Icon} />
            Margin
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => {
              addProp({ padding: "1em" });
            }}
          >
            <ArrowRightToLine className={s.Icon} />
            Padding
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              addProp({ border: "1px solid black" });
            }}
          >
            <Square className={s.Icon} />
            Border
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              addProp({ borderRadius: "10px" });
            }}
          >
            <Squircle className={s.Icon} />
            Roundness
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div>
        {cssProps.map((prop, i) => (
          <div key={prop.id} className={s.Prop}>
            <div className={s.PropTitle}>
              {prop.fontSize && (
                <Label className={s.LabelRow}>
                  <Type className={s.IconNoMargin} />
                  Font Size
                </Label>
              )}
              {prop.fontWeight && (
                <Label className={s.LabelRow}>
                  <AlignLeft className={s.IconNoMargin} />
                  Font Weight
                </Label>
              )}
              {prop.textAlign && (
                <Label className={s.LabelRow}>
                  <AlignLeft className={s.IconNoMargin} />
                  Text Align
                </Label>
              )}
              {prop.margin && (
                <Label className={s.LabelRow}>
                  <ArrowRightFromLine className={s.IconNoMargin} />
                  Margin
                </Label>
              )}
              {prop.padding && (
                <Label className={s.LabelRow}>
                  <ArrowRightToLine className={s.IconNoMargin} />
                  Padding
                </Label>
              )}
              {prop.border && (
                <Label className={s.LabelRow}>
                  <Square className={s.IconNoMargin} />
                  Border
                </Label>
              )}
              {prop.borderRadius && (
                <Label className={s.LabelRow}>
                  <Squircle className={s.IconNoMargin} />
                  Roundness
                </Label>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger>
                  <MoreVertical className={s.IconNoMargin} />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onSelect={() => {
                      cssProps.splice(i, 1);
                    }}
                  >
                    <Trash className={s.Icon} />
                    Remove
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      if (!prop.condition) {
                        prop.condition = {};
                      } else {
                        prop.condition = undefined;
                      }
                    }}
                  >
                    <CopySlash className={s.Icon} />
                    {prop.condition ? "Remove Condition" : "Add Condition"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {prop.fontSize && (
              <Input
                value={prop.fontSize}
                onChange={(e) => {
                  prop.fontSize = e.target.value;
                }}
              />
            )}
            {prop.fontWeight && (
              <Select
                value={prop.fontWeight}
                onValueChange={(value) => {
                  prop.fontWeight = value as
                    | "lighter"
                    | "normal"
                    | "bolder"
                    | "bold";
                }}
              >
                <SelectTrigger className={s.MarginTop}>
                  <SelectValue placeholder="Font Weight" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lighter">Lighter</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="bolder">Bolder</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                </SelectContent>
              </Select>
            )}
            {prop.textAlign && (
              <Select
                value={prop.textAlign}
                onValueChange={(value) => {
                  prop.textAlign = value as "left" | "center" | "right";
                }}
              >
                <SelectTrigger className={s.MarginTop}>
                  <SelectValue placeholder="Text Align" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            )}
            {prop.margin && (
              <Input
                value={prop.margin}
                onChange={(e) => {
                  prop.margin = e.target.value;
                }}
              />
            )}
            {prop.padding && (
              <Input
                value={prop.padding}
                onChange={(e) => {
                  prop.padding = e.target.value;
                }}
              />
            )}
            {prop.border && (
              <Input
                value={prop.border}
                onChange={(e) => {
                  prop.border = e.target.value;
                }}
              />
            )}
            {prop.borderRadius && (
              <Input
                value={prop.borderRadius}
                onChange={(e) => {
                  prop.borderRadius = e.target.value;
                }}
              />
            )}
            {prop.condition && (
              <div className={s.MarginTop}>
                <div className={s.PaddingVertical}>
                  <Label className={s.LabelRow}>
                    <Ruler className={s.IconNoMargin} />
                    Breakpoint
                  </Label>
                  <div>
                    <Select
                      value={prop.condition.breakpoint}
                      onValueChange={(value) => {
                        if (prop.condition) {
                          prop.condition.breakpoint = value as
                            | "sm"
                            | "md"
                            | "lg"
                            | "xl"
                            | "2xl";
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Breakpoint" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="sm">Small</SelectItem>
                        <SelectItem value="md">Medium</SelectItem>
                        <SelectItem value="lg">Large</SelectItem>
                        <SelectItem value="xl">Extra Large</SelectItem>
                        <SelectItem value="2xl">Extra Extra Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* {prop.condition.onHover && (
                    <div className="text-sm">On Hover</div>
                  )} */}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

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
      const id = rest.tyzo.id;

      return (
        <div className={`css-${id}`}>
          <style dangerouslySetInnerHTML={{ __html: toCss(id, css) }}></style>
          {/* todo move this into one stylesheet in the header */}
          <Comp {...rest} />
        </div>
      );
    },
  };
}
