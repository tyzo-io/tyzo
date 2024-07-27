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
import { useTranslations } from "../i18n";

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
  const { translations } = useTranslations();
  return (
    <div className={s.PaddingVertical}>
      <Label className={s.LabelRow}>
        <Ruler className={s.IconNoMargin} />
        {translations.breakpoint}
      </Label>
      <div>
        <Select
          value={breakpoint}
          onValueChange={(value) => {
            onChange(value as Breakpoint);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={translations.breakpoint} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{translations.none}</SelectItem>
            <SelectItem value="sm">{translations.small}</SelectItem>
            <SelectItem value="md">{translations.medium}</SelectItem>
            <SelectItem value="lg">{translations.large}</SelectItem>
            <SelectItem value="xl">{translations.extraLarge}</SelectItem>
            <SelectItem value="2xl">{translations.extraExtraLarge}</SelectItem>
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
  const { translations } = useTranslations();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={s.Button}>
        <Plus />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{translations.text}</DropdownMenuLabel>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Type className={s.Icon} />
            <span>{translations.fontSize}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onSelect={() => {
                  addProp({ fontSize: "0.8rem" });
                }}
              >
                <Type className={s.SmallIcon} /> {translations.small}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  addProp({ fontSize: "1rem" });
                }}
              >
                <Type className={s.Icon} /> {translations.medium}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  addProp({ fontSize: "2rem" });
                }}
              >
                <Type className={s.BigIcon} /> {translations.large}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <AlignLeft className={s.Icon} />
            <span>{translations.textAlign}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onSelect={() => {
                  addProp({ textAlign: "left" });
                }}
              >
                <AlignLeft className={s.Icon} /> {translations.left}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  addProp({ textAlign: "center" });
                }}
              >
                <AlignCenter className={s.Icon} />
                {translations.center}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  addProp({ textAlign: "right" });
                }}
              >
                <AlignRight className={s.Icon} />
                {translations.right}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Bold className={s.Icon} />
            <span>{translations.fontWeight}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onSelect={() => {
                  addProp({ fontWeight: "lighter" });
                }}
              >
                <Bold className={s.Icon} strokeWidth={2} />{" "}
                {translations.lighter}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  addProp({ fontWeight: "normal" });
                }}
              >
                <Bold className={s.Icon} strokeWidth={3} />{" "}
                {translations.normal}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  addProp({ fontWeight: "bolder" });
                }}
              >
                <Bold className={s.Icon} strokeWidth={4} />{" "}
                {translations.bolder}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  addProp({ fontWeight: "bold" });
                }}
              >
                <Bold className={s.Icon} strokeWidth={5} /> {translations.bold}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>{translations.layout}</DropdownMenuLabel>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Ruler className={s.Icon} />
            <span>{translations.size}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onSelect={() => {
                  addProp({ width: "1em" });
                }}
              >
                <MoveHorizontal className={s.Icon} /> {translations.width}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  addProp({ height: "1em" });
                }}
              >
                <MoveVertical className={s.Icon} /> {translations.height}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  addProp({ minWidth: "1em" });
                }}
              >
                <MoveHorizontal className={s.Icon} /> {translations.minWidth}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  addProp({ minHeight: "1em" });
                }}
              >
                <MoveVertical className={s.Icon} /> {translations.minHeight}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  addProp({ maxWidth: "1em" });
                }}
              >
                <MoveHorizontal className={s.Icon} /> {translations.maxWidth}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  addProp({ maxHeight: "1em" });
                }}
              >
                <MoveVertical className={s.Icon} /> {translations.maxHeight}
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
          {translations.margin}
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={() => {
            addProp({ padding: "1em" });
          }}
        >
          <ArrowRightToLine className={s.Icon} />
          {translations.padding}
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>{translations.style}</DropdownMenuLabel>

        <DropdownMenuItem
          onSelect={() => {
            addProp({ border: "1px solid black" });
          }}
        >
          <Square className={s.Icon} />
          {translations.border}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            addProp({ borderRadius: "10px" });
          }}
        >
          <Squircle className={s.Icon} />
          {translations.roundness}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            addProp({ shadow: "1px 1px 1px black" });
          }}
        >
          <Blend className={s.Icon} />
          {translations.shadow}
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={() => {
            addProp({ customStyle: "" });
          }}
        >
          <Paintbrush className={s.Icon} />
          {translations.customStyle}
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
  const { translations } = useTranslations();
  return (
    <div className={s.PropTitle}>
      {isDefined(prop.fontSize) && (
        <Label className={s.LabelRow}>
          <Type className={s.IconNoMargin} />
          {translations.fontSize}
        </Label>
      )}
      {isDefined(prop.fontWeight) && (
        <Label className={s.LabelRow}>
          <AlignLeft className={s.IconNoMargin} />
          {translations.fontWeight}
        </Label>
      )}
      {isDefined(prop.textAlign) && (
        <Label className={s.LabelRow}>
          <AlignLeft className={s.IconNoMargin} />
          {translations.textAlign}
        </Label>
      )}
      {isDefined(prop.display) && (
        <Label className={s.LabelRow}>
          <Eye className={s.IconNoMargin} />
          {translations.display}
        </Label>
      )}
      {isDefined(prop.flexDirection) && (
        <Label className={s.LabelRow}>
          <Move className={s.IconNoMargin} />
          {translations.flexDirection}
        </Label>
      )}
      {isDefined(prop.justifyContent) && (
        <Label className={s.LabelRow}>
          <AlignVerticalJustifyCenter className={s.IconNoMargin} />
          {translations.justifyContent}
        </Label>
      )}
      {isDefined(prop.alignItems) && (
        <Label className={s.LabelRow}>
          <AlignCenterVertical className={s.IconNoMargin} />
          {translations.alignItems}
        </Label>
      )}
      {isDefined(prop.gap) && (
        <Label className={s.LabelRow}>
          <Space className={s.IconNoMargin} />
          {translations.gap}
        </Label>
      )}
      {isDefined(prop.width) && (
        <Label className={s.LabelRow}>
          <MoveHorizontal className={s.IconNoMargin} />
          {translations.width}
        </Label>
      )}
      {isDefined(prop.height) && (
        <Label className={s.LabelRow}>
          <MoveVertical className={s.IconNoMargin} />
          {translations.height}
        </Label>
      )}
      {isDefined(prop.minWidth) && (
        <Label className={s.LabelRow}>
          <MoveHorizontal className={s.IconNoMargin} />
          {translations.minWidth}
        </Label>
      )}
      {isDefined(prop.minHeight) && (
        <Label className={s.LabelRow}>
          <MoveVertical className={s.IconNoMargin} />
          {translations.minHeight}
        </Label>
      )}
      {isDefined(prop.maxWidth) && (
        <Label className={s.LabelRow}>
          <MoveHorizontal className={s.IconNoMargin} />
          {translations.maxWidth}
        </Label>
      )}
      {isDefined(prop.maxHeight) && (
        <Label className={s.LabelRow}>
          <MoveVertical className={s.IconNoMargin} />
          {translations.maxHeight}
        </Label>
      )}
      {isDefined(prop.margin) && (
        <Label className={s.LabelRow}>
          <ArrowRightFromLine className={s.IconNoMargin} />
          {translations.margin}
        </Label>
      )}
      {isDefined(prop.padding) && (
        <Label className={s.LabelRow}>
          <ArrowRightToLine className={s.IconNoMargin} />
          {translations.padding}
        </Label>
      )}
      {isDefined(prop.border) && (
        <Label className={s.LabelRow}>
          <Square className={s.IconNoMargin} />
          {translations.border}
        </Label>
      )}
      {isDefined(prop.borderRadius) && (
        <Label className={s.LabelRow}>
          <Squircle className={s.IconNoMargin} />
          {translations.roundness}
        </Label>
      )}
      {isDefined(prop.shadow) && (
        <Label className={s.LabelRow}>
          <Blend className={s.IconNoMargin} />
          {translations.shadow}
        </Label>
      )}
      {isDefined(prop.customStyle) && (
        <Label className={s.LabelRow}>
          <Paintbrush className={s.IconNoMargin} />
          {translations.customStyle}
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
              {translations.remove}
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
              {prop.condition
                ? translations.removeCondition
                : translations.addCondition}
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
  const { translations } = useTranslations();
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
            <SelectValue placeholder={translations.fontWeight} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lighter">{translations.lighter}</SelectItem>
            <SelectItem value="normal">{translations.normal}</SelectItem>
            <SelectItem value="bolder">{translations.bolder}</SelectItem>
            <SelectItem value="bold">{translations.bold}</SelectItem>
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
            <SelectValue placeholder={translations.textAlign} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">{translations.left}</SelectItem>
            <SelectItem value="center">{translations.center}</SelectItem>
            <SelectItem value="right">{translations.right}</SelectItem>
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
            <SelectValue placeholder={translations.display} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{translations.none}</SelectItem>
            <SelectItem value="block">{translations.block}</SelectItem>
            <SelectItem value="flex">{translations.flex}</SelectItem>
            <SelectItem value="inline">{translations.inline}</SelectItem>
            <SelectItem value="inline-block">{translations.inlineBlock}</SelectItem>
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
            <SelectValue placeholder={translations.flexDirection} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="row">{translations.row}</SelectItem>
            <SelectItem value="column">{translations.column}</SelectItem>
            <SelectItem value="row-reverse">{translations.rowReverse}</SelectItem>
            <SelectItem value="column-reverse">{translations.columnReverse}</SelectItem>
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
            <SelectValue placeholder={translations.justifyContent} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="flex-start">{translations.flexStart}</SelectItem>
            <SelectItem value="flex-end">{translations.flexEnd}</SelectItem>
            <SelectItem value="center">{translations.center}</SelectItem>
            <SelectItem value="space-between">{translations.spaceBetween}</SelectItem>
            <SelectItem value="space-evenly">{translations.spaceEvenly}</SelectItem>
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
            <SelectValue placeholder={translations.alignItems} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="flex-start">{translations.flexStart}</SelectItem>
            <SelectItem value="flex-end">{translations.flexEnd}</SelectItem>
            <SelectItem value="center">{translations.center}</SelectItem>
            <SelectItem value="baseline">{translations.baseline}</SelectItem>
            <SelectItem value="stretch">{translations.stretch}</SelectItem>
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
