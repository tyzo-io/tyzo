import type { ComponentConfig } from "@measured/puck";
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
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const cssProperty: ComponentConfig & { type: "custom" } = {
  type: "custom",
  render(props) {
    const cssProps: ComponentCssProperty[] = props.value ?? [];
    const addProp = (value: Omit<ComponentCssProperty, "id">) =>
      props.onChange([
        ...cssProps,
        {
          id: crypto.randomUUID().split("-")[0],
          ...value,
        },
      ]);
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Plus />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Text</DropdownMenuLabel>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Type className="h-4 w-4 mr-2" />
                <span>Font Size</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    onSelect={() => {
                      addProp({ fontSize: "0.8rem" });
                    }}
                  >
                    <Type className="h-2 w-2 mr-2" /> Small
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      addProp({ fontSize: "1rem" });
                    }}
                  >
                    <Type className="h-4 w-4 mr-2" /> Medium
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      addProp({ fontSize: "2rem" });
                    }}
                  >
                    <Type className="h-6 w-6 mr-2" /> Large
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <AlignLeft className="h-4 w-4 mr-2" />
                <span>Text Align</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    onSelect={() => {
                      addProp({ textAlign: "left" });
                    }}
                  >
                    <AlignLeft className="h-4 w-4 mr-2" /> Left
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      addProp({ textAlign: "center" });
                    }}
                  >
                    <AlignCenter className="h-4 w-4 mr-2" />
                    Center
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      addProp({ textAlign: "right" });
                    }}
                  >
                    <AlignRight className="h-4 w-4 mr-2" />
                    Right
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Bold className="h-4 w-4 mr-2" />
                <span>Font Weight</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    onSelect={() => {
                      addProp({ fontWeight: "lighter" });
                    }}
                  >
                    <Bold className="h-4 w-4 mr-2" strokeWidth={2} /> Lighter
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      addProp({ fontWeight: "normal" });
                    }}
                  >
                    <Bold className="h-4 w-4 mr-2" strokeWidth={3} /> Normal
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      addProp({ fontWeight: "bolder" });
                    }}
                  >
                    <Bold className="h-4 w-4 mr-2" strokeWidth={4} /> Bolder
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      addProp({ fontWeight: "bold" });
                    }}
                  >
                    <Bold className="h-4 w-4 mr-2" strokeWidth={5} /> Bold
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
              <ArrowRightFromLine className="h-4 w-4 mr-2" />
              Margin
            </DropdownMenuItem>

            <DropdownMenuItem
              onSelect={() => {
                addProp({ padding: "1em" });
              }}
            >
              <ArrowRightToLine className="h-4 w-4 mr-2" />
              Padding
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                addProp({ border: "1px solid black" });
              }}
            >
              <Square className="h-4 w-4 mr-2" />
              Border
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                addProp({ borderRadius: "10px" });
              }}
            >
              <Squircle className="h-4 w-4 mr-2" />
              Roundness
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div>
          {cssProps.map((prop) => (
            <div key={prop.id} className="border-b py-4 text-sm">
              <div className="flex items-center gap-2 justify-between">
                {prop.fontSize && (
                  <Label className="flex flex-row items-center gap-2">
                    <Type className="h-4 w-4" />
                    Font Size
                  </Label>
                )}
                {prop.fontWeight && (
                  <Label className="flex flex-row items-center gap-2">
                    <AlignLeft className="h-4 w-4" />
                    Font Weight
                  </Label>
                )}
                {prop.textAlign && (
                  <Label className="flex flex-row items-center gap-2">
                    <AlignLeft className="h-4 w-4" />
                    Text Align
                  </Label>
                )}
                {prop.margin && (
                  <Label className="flex flex-row items-center gap-2">
                    <ArrowRightFromLine className="h-4 w-4" />
                    Margin
                  </Label>
                )}
                {prop.padding && (
                  <Label className="flex flex-row items-center gap-2">
                    <ArrowRightToLine className="h-4 w-4" />
                    Padding
                  </Label>
                )}
                {prop.border && (
                  <Label className="flex flex-row items-center gap-2">
                    <Square className="h-4 w-4" />
                    Border
                  </Label>
                )}
                {prop.borderRadius && (
                  <Label className="flex flex-row items-center gap-2">
                    <Squircle className="h-4 w-4" />
                    Roundness
                  </Label>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <MoreVertical className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onSelect={() => {
                        props.onChange(
                          cssProps.filter((p) => p.id !== prop.id)
                        );
                      }}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => {
                        if (!prop.condition) {
                          props.onChange(
                            cssProps.map((p) =>
                              p.id === prop.id
                                ? {
                                    ...p,
                                    condition: {},
                                  }
                                : p
                            )
                          );
                        } else {
                          props.onChange(
                            cssProps.map((p) =>
                              p.id === prop.id
                                ? {
                                    ...p,
                                    condition: undefined,
                                  }
                                : p
                            )
                          );
                        }
                      }}
                    >
                      <CopySlash className="h-4 w-4 mr-2" />
                      {prop.condition ? "Remove Condition" : "Add Condition"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {prop.fontSize && (
                <Input
                  className="mt-2"
                  value={prop.fontSize}
                  onChange={(e) => {
                    props.onChange(
                      cssProps.map((p) =>
                        p.id === prop.id
                          ? { ...p, fontSize: e.target.value }
                          : p
                      )
                    );
                  }}
                />
              )}
              {prop.fontWeight && (
                <Select
                  value={prop.fontWeight}
                  onValueChange={(value) => {
                    props.onChange(
                      cssProps.map((p) =>
                        p.id === prop.id ? { ...p, fontWeight: value } : p
                      )
                    );
                  }}
                >
                  <SelectTrigger className="mt-2">
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
                    props.onChange(
                      cssProps.map((p) =>
                        p.id === prop.id ? { ...p, textAlign: value } : p
                      )
                    );
                  }}
                >
                  <SelectTrigger className="mt-2">
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
                  className="mt-2"
                  value={prop.margin}
                  onChange={(e) => {
                    props.onChange(
                      cssProps.map((p) =>
                        p.id === prop.id ? { ...p, margin: e.target.value } : p
                      )
                    );
                  }}
                />
              )}
              {prop.padding && (
                <Input
                  className="mt-2"
                  value={prop.padding}
                  onChange={(e) => {
                    props.onChange(
                      cssProps.map((p) =>
                        p.id === prop.id ? { ...p, padding: e.target.value } : p
                      )
                    );
                  }}
                />
              )}
              {prop.border && (
                <Input
                  className="mt-2"
                  value={prop.border}
                  onChange={(e) => {
                    props.onChange(
                      cssProps.map((p) =>
                        p.id === prop.id ? { ...p, border: e.target.value } : p
                      )
                    );
                  }}
                />
              )}
              {prop.borderRadius && (
                <Input
                  className="mt-2"
                  value={prop.borderRadius}
                  onChange={(e) => {
                    props.onChange(
                      cssProps.map((p) =>
                        p.id === prop.id
                          ? { ...p, borderRadius: e.target.value }
                          : p
                      )
                    );
                  }}
                />
              )}
              {prop.condition && (
                <div className="mt-2">
                  <div className="py-2">
                    <Label className="flex flex-row items-center gap-2 mb-2">
                      <Ruler className="h-4 w-4" />
                      Breakpoint
                    </Label>
                    <div>
                      <Select
                        value={prop.condition.breakpoint}
                        onValueChange={(value) => {
                          props.onChange(
                            cssProps.map((p) =>
                              p.id === prop.id
                                ? {
                                    ...p,
                                    condition: {
                                      ...p.condition,
                                      breakpoint:
                                        value === "none" ? undefined : value,
                                    },
                                  }
                                : p
                            )
                          );
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
  },
};

export function withCss<T extends ComponentConfig<any>>(
  component: T,
  defaultCssProps?: Omit<ComponentCssProperty, "id">[]
): T {
  return {
    ...component,
    fields: {
      ...component.fields,
      css: {
        ...cssProperty,
      },
    },
    defaultProps: {
      css: defaultCssProps?.map((p) => ({
        ...p,
        id: crypto.randomUUID().split("-")[0],
      })),
      ...component.defaultProps,
    },
    render: (props: { id: string; css: ComponentCssProperty[] }) => {
      const { css, ...rest } = props;
      const Comp = component.render;
      const id = rest.id;

      return (
        <div className={`css-${id}`}>
          <style>{toCss(id, css)}</style>
          {/* todo move this into one stylesheet in the header */}
          <Comp {...rest} />
        </div>
      );
    },
  };
}
