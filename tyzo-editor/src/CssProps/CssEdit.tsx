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
  AlignCenterVertical,
  AlignLeft,
  AlignRight,
  AlignVerticalJustifyCenter,
  ArrowRightFromLine,
  ArrowRightToLine,
  Blend,
  Bold,
  CopySlash,
  Eye,
  MoreVertical,
  Move,
  MoveHorizontal,
  MoveVertical,
  Paintbrush,
  Plus,
  Ruler,
  Space,
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
import { Breakpoint, ComponentCssProperty } from ".";

function isDefined(value: any) {
  return value !== undefined && value !== null;
}

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
      <CssDropdown addProp={addProp} />
      <div>
        {cssProps.map((prop, i) => (
          <div key={prop.id} className={s.Prop}>
            <CssRuleTitle
              prop={prop}
              showEdit
              onRemove={() => {
                cssProps.splice(i, 1);
              }}
            />
            <CssRuleEdit
              prop={prop}
              onChange={(value) => {
                for (const key of Object.keys(value)) {
                  if (key === "condition" || key === "id") {
                    continue;
                  }
                  const name = key as keyof ComponentCssProperty;
                  (prop as any)[name] = value[name];
                }
                if (value.condition && prop.condition) {
                  for (const key of Object.keys(value.condition)) {
                    if (key === "id") {
                      continue;
                    }
                    const name = key as keyof ComponentCssProperty["condition"];
                    (prop.condition as any)[name] = value.condition[name];
                  }
                }
              }}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export function BreakpointSelector({
  breakpoint,
  onChange,
}: {
  breakpoint: Breakpoint | undefined;
  onChange: (value: Breakpoint) => void;
}) {
  return (
    <div className={s.PaddingVertical}>
      <Label className={s.LabelRow}>
        <Ruler className={s.IconNoMargin} />
        Breakpoint
      </Label>
      <div>
        <Select
          value={breakpoint}
          onValueChange={(value) => {
            onChange(value as Breakpoint);
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
  );
}

export function CssDropdown({
  addProp,
}: {
  addProp: (value: Omit<ComponentCssProperty, "id">) => void;
}) {
  return (
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

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Ruler className={s.Icon} />
            <span>Size</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onSelect={() => {
                  addProp({ width: "1em" });
                }}
              >
                <MoveHorizontal className={s.Icon} /> Width
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  addProp({ height: "1em" });
                }}
              >
                <MoveVertical className={s.Icon} /> Height
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  addProp({ minWidth: "1em" });
                }}
              >
                <MoveHorizontal className={s.Icon} /> Min Width
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  addProp({ minHeight: "1em" });
                }}
              >
                <MoveVertical className={s.Icon} /> Min Height
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  addProp({ maxWidth: "1em" });
                }}
              >
                <MoveHorizontal className={s.Icon} /> Max Width
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  addProp({ maxHeight: "1em" });
                }}
              >
                <MoveVertical className={s.Icon} /> Max Height
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

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
        <DropdownMenuItem
          onSelect={() => {
            addProp({ shadow: "1px 1px 1px black" });
          }}
        >
          <Blend className={s.Icon} />
          Shadow
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Custom</DropdownMenuLabel>
        <DropdownMenuItem
          onSelect={() => {
            addProp({ customStyle: "" });
          }}
        >
          <Paintbrush className={s.Icon} />
          Custom style
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function CssRuleTitle({
  prop,
  showEdit,
  onRemove,
}: {
  prop: ComponentCssProperty;
  showEdit?: boolean;
  onRemove?: () => void;
}) {
  return (
    <div className={s.PropTitle}>
      {isDefined(prop.fontSize) && (
        <Label className={s.LabelRow}>
          <Type className={s.IconNoMargin} />
          Font Size
        </Label>
      )}
      {isDefined(prop.fontWeight) && (
        <Label className={s.LabelRow}>
          <AlignLeft className={s.IconNoMargin} />
          Font Weight
        </Label>
      )}
      {isDefined(prop.textAlign) && (
        <Label className={s.LabelRow}>
          <AlignLeft className={s.IconNoMargin} />
          Text Align
        </Label>
      )}
      {isDefined(prop.display) && (
        <Label className={s.LabelRow}>
          <Eye className={s.IconNoMargin} />
          Display
        </Label>
      )}
      {isDefined(prop.flexDirection) && (
        <Label className={s.LabelRow}>
          <Move className={s.IconNoMargin} />
          Flex Direction
        </Label>
      )}
      {isDefined(prop.justifyContent) && (
        <Label className={s.LabelRow}>
          <AlignVerticalJustifyCenter className={s.IconNoMargin} />
          Justify Content
        </Label>
      )}
      {isDefined(prop.alignItems) && (
        <Label className={s.LabelRow}>
          <AlignCenterVertical className={s.IconNoMargin} />
          Align Items
        </Label>
      )}
      {isDefined(prop.gap) && (
        <Label className={s.LabelRow}>
          <Space className={s.IconNoMargin} />
          Gap
        </Label>
      )}
      {isDefined(prop.width) && (
        <Label className={s.LabelRow}>
          <MoveHorizontal className={s.IconNoMargin} />
          Width
        </Label>
      )}
      {isDefined(prop.height) && (
        <Label className={s.LabelRow}>
          <MoveVertical className={s.IconNoMargin} />
          Height
        </Label>
      )}
      {isDefined(prop.minWidth) && (
        <Label className={s.LabelRow}>
          <MoveHorizontal className={s.IconNoMargin} />
          Min Width
        </Label>
      )}
      {isDefined(prop.minHeight) && (
        <Label className={s.LabelRow}>
          <MoveVertical className={s.IconNoMargin} />
          Min Height
        </Label>
      )}
      {isDefined(prop.maxWidth) && (
        <Label className={s.LabelRow}>
          <MoveHorizontal className={s.IconNoMargin} />
          Max Width
        </Label>
      )}
      {isDefined(prop.maxHeight) && (
        <Label className={s.LabelRow}>
          <MoveVertical className={s.IconNoMargin} />
          Max Height
        </Label>
      )}
      {isDefined(prop.margin) && (
        <Label className={s.LabelRow}>
          <ArrowRightFromLine className={s.IconNoMargin} />
          Margin
        </Label>
      )}
      {isDefined(prop.padding) && (
        <Label className={s.LabelRow}>
          <ArrowRightToLine className={s.IconNoMargin} />
          Padding
        </Label>
      )}
      {isDefined(prop.border) && (
        <Label className={s.LabelRow}>
          <Square className={s.IconNoMargin} />
          Border
        </Label>
      )}
      {isDefined(prop.borderRadius) && (
        <Label className={s.LabelRow}>
          <Squircle className={s.IconNoMargin} />
          Roundness
        </Label>
      )}
      {isDefined(prop.shadow) && (
        <Label className={s.LabelRow}>
          <Blend className={s.IconNoMargin} />
          Shadow
        </Label>
      )}
      {isDefined(prop.customStyle) && (
        <Label className={s.LabelRow}>
          <Paintbrush className={s.IconNoMargin} />
          Custom style
        </Label>
      )}

      {showEdit && (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <MoreVertical className={s.IconNoMargin} />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onSelect={() => {
                onRemove?.();
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
      )}
    </div>
  );
}

export function CssRuleEdit({
  prop,
  onChange,
}: {
  prop: ComponentCssProperty;
  onChange: (value: Partial<ComponentCssProperty>) => void;
}) {
  return (
    <>
      {isDefined(prop.fontSize) && (
        <Input
          value={prop.fontSize}
          onChange={(e) => onChange({ fontSize: e.target.value })}
        />
      )}
      {isDefined(prop.fontWeight) && (
        <Select
          value={prop.fontWeight}
          onValueChange={(value) =>
            onChange({
              fontWeight: value as "lighter" | "normal" | "bolder" | "bold",
            })
          }
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
      {isDefined(prop.textAlign) && (
        <Select
          value={prop.textAlign}
          onValueChange={(value) =>
            onChange({
              textAlign: value as "left" | "center" | "right",
            })
          }
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
      {isDefined(prop.display) && (
        <Select
          value={prop.display}
          onValueChange={(value) =>
            onChange({
              display: value as
                | "flex"
                | "none"
                | "block"
                | "inline"
                | "inline-block"
                | undefined,
            })
          }
        >
          <SelectTrigger className={s.MarginTop}>
            <SelectValue placeholder="Display" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="block">Block</SelectItem>
            <SelectItem value="flex">Flex</SelectItem>
            <SelectItem value="inline">Inline</SelectItem>
            <SelectItem value="inline-block">Inline Block</SelectItem>
          </SelectContent>
        </Select>
      )}
      {isDefined(prop.flexDirection) && (
        <Select
          value={prop.flexDirection}
          onValueChange={(value) =>
            onChange({
              flexDirection: value as
                | "row"
                | "column"
                | "row-reverse"
                | "column-reverse"
                | undefined,
            })
          }
        >
          <SelectTrigger className={s.MarginTop}>
            <SelectValue placeholder="Flex Direction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="row">Row</SelectItem>
            <SelectItem value="column">Column</SelectItem>
            <SelectItem value="row-reverse">Row Reverse</SelectItem>
            <SelectItem value="column-reverse">Column Reverse</SelectItem>
          </SelectContent>
        </Select>
      )}
      {isDefined(prop.justifyContent) && (
        <Select
          value={prop.justifyContent}
          onValueChange={(value) =>
            onChange({
              justifyContent: value as
                | "flex-start"
                | "flex-end"
                | "center"
                | "space-between"
                | "space-evenly"
                | undefined,
            })
          }
        >
          <SelectTrigger className={s.MarginTop}>
            <SelectValue placeholder="Justify Content" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="flex-start">Flex Start</SelectItem>
            <SelectItem value="flex-end">Flex End</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="space-between">Space Between</SelectItem>
            <SelectItem value="space-evenly">Space Evenly</SelectItem>
          </SelectContent>
        </Select>
      )}
      {isDefined(prop.alignItems) && (
        <Select
          value={prop.alignItems}
          onValueChange={(value) =>
            onChange({
              alignItems: value as
                | "flex-start"
                | "flex-end"
                | "center"
                | "baseline"
                | "stretch"
                | undefined,
            })
          }
        >
          <SelectTrigger className={s.MarginTop}>
            <SelectValue placeholder="Align Items" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="flex-start">Flex Start</SelectItem>
            <SelectItem value="flex-end">Flex End</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="baseline">Baseline</SelectItem>
            <SelectItem value="stretch">Stretch</SelectItem>
          </SelectContent>
        </Select>
      )}
      {isDefined(prop.gap) && (
        <Input
          value={prop.gap}
          onChange={(e) =>
            onChange({
              gap: e.target.value,
            })
          }
        />
      )}
      {isDefined(prop.width) && (
        <Input
          value={prop.width}
          onChange={(e) =>
            onChange({
              width: e.target.value,
            })
          }
        />
      )}
      {isDefined(prop.height) && (
        <Input
          value={prop.height}
          onChange={(e) =>
            onChange({
              height: e.target.value,
            })
          }
        />
      )}
      {isDefined(prop.minWidth) && (
        <Input
          value={prop.minWidth}
          onChange={(e) =>
            onChange({
              minWidth: e.target.value,
            })
          }
        />
      )}
      {isDefined(prop.minHeight) && (
        <Input
          value={prop.minHeight}
          onChange={(e) =>
            onChange({
              minHeight: e.target.value,
            })
          }
        />
      )}
      {isDefined(prop.maxWidth) && (
        <Input
          value={prop.maxWidth}
          onChange={(e) =>
            onChange({
              maxWidth: e.target.value,
            })
          }
        />
      )}
      {isDefined(prop.maxHeight) && (
        <Input
          value={prop.maxHeight}
          onChange={(e) =>
            onChange({
              maxHeight: e.target.value,
            })
          }
        />
      )}
      {isDefined(prop.margin) && (
        <Input
          value={prop.margin}
          onChange={(e) =>
            onChange({
              margin: e.target.value,
            })
          }
        />
      )}
      {isDefined(prop.padding) && (
        <Input
          value={prop.padding}
          onChange={(e) =>
            onChange({
              padding: e.target.value,
            })
          }
        />
      )}
      {isDefined(prop.border) && (
        <Input
          value={prop.border}
          onChange={(e) =>
            onChange({
              border: e.target.value,
            })
          }
        />
      )}
      {isDefined(prop.borderRadius) && (
        <Input
          value={prop.borderRadius}
          onChange={(e) =>
            onChange({
              borderRadius: e.target.value,
            })
          }
        />
      )}
      {isDefined(prop.shadow) && (
        <Input
          value={prop.shadow}
          onChange={(e) =>
            onChange({
              shadow: e.target.value,
            })
          }
        />
      )}
      {isDefined(prop.customStyle) && (
        <Input
          value={prop.customStyle}
          onChange={(e) =>
            onChange({
              customStyle: e.target.value,
            })
          }
        />
      )}
      {prop.condition && (
        <div className={s.MarginTop}>
          <BreakpointSelector
            breakpoint={prop.condition.breakpoint}
            onChange={(breakpoint) => {
              if (prop.condition) {
                // prop.condition.breakpoint = breakpoint;
                // prop.condition.breakpoint = breakpoint;
                onChange({
                  condition: {
                    ...prop.condition,
                    breakpoint,
                  },
                });
              }
            }}
          />
          {/* {prop.condition.onHover && (
                    <div className="text-sm">On Hover</div>
                  )} */}
        </div>
      )}
    </>
  );
}
