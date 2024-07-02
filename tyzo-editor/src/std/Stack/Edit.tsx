import {
  ComponentInfo,
  EditorInput,
  ElementContainer,
  InputMap,
  PageElement,
  StringProperty,
} from "../../types";
import s from "./Edit.module.css";
import { Button } from "../../components/Button";
import { Trash } from "lucide-react";
import { BreakpointSelector, ComponentCssProperty, CssRuleEdit, CssRuleTitle } from "../../lib";
import { useTranslations } from "../../i18n";

function StackCssEdit({
  id,
  value,
  setValue,
}: {
  id: string;
  value: ComponentCssProperty | undefined;
  setValue: (value: Partial<ComponentCssProperty> | undefined) => void;
}) {
  const flexDirection = value?.flexDirection ?? "row";
  const justifyContent = value?.justifyContent ?? "flex-start";
  const alignItems = value?.alignItems ?? "flex-start";
  const gap = value?.gap ?? "";
  return (
    <>
      <div className={s.Row}>
        <CssRuleTitle prop={{ id, flexDirection }} />
        <CssRuleEdit
          prop={{
            id,
            flexDirection,
          }}
          onChange={setValue}
        />
      </div>
      <div className={s.Row}>
        <CssRuleTitle prop={{ id, justifyContent }} />
        <CssRuleEdit
          prop={{
            id,
            justifyContent,
          }}
          onChange={setValue}
        />
      </div>
      <div className={s.Row}>
        <CssRuleTitle prop={{ id, alignItems }} />
        <CssRuleEdit
          prop={{
            id,
            alignItems,
          }}
          onChange={setValue}
        />
      </div>
      <div className={s.Row}>
        <CssRuleTitle prop={{ id, gap }} />
        <CssRuleEdit
          prop={{
            id,
            gap,
          }}
          onChange={setValue}
        />
      </div>
    </>
  );
}

export const StackEdit: EditorInput<{
  property: StringProperty;
  element: PageElement;
  elementContainer: ElementContainer;
  components: ComponentInfo[];
  inputs: InputMap;
  value: ComponentCssProperty | undefined;
  setValue: (value: ComponentCssProperty | undefined) => void;
}> = function StackEdit(props) {
  return (
    <div className={s.Container}>
      <StackCssEdit
        id={props.element.id}
        value={props.value}
        setValue={(value) => {
          if (!props.value) {
            props.setValue({ id: props.element.id, ...value });
          } else {
            for (const key of Object.keys(value ?? {})) {
              const name = key as keyof ComponentCssProperty;
              (props.value as any)[name] = value![name];
            }
          }
        }}
      />
    </div>
  );
};

export const StackBreakpointsEdit: EditorInput<{
  property: StringProperty;
  element: PageElement;
  elementContainer: ElementContainer;
  components: ComponentInfo[];
  inputs: InputMap;
  value: ComponentCssProperty[];
  setValue: (value: ComponentCssProperty[]) => void;
}> = function StackEdit(props) {
  const { translations } = useTranslations();
  return (
    <div className={s.Container}>
      <div className={s.title}>{translations.breakpoints}</div>

      {props.value?.map((breakpoint, i) => (
        <div key={i} className={s.Breakpoint}>
          <div className={s.BreakpointTitle}>
            <BreakpointSelector
              breakpoint={breakpoint.condition?.breakpoint}
              onChange={(value) => {
                if (breakpoint.condition) {
                  breakpoint.condition.breakpoint = value;
                }
              }}
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                props.value?.splice(i, 1);
              }}
              aria-label="Remove breakpoint"
            >
              <Trash />
            </Button>
          </div>
          <StackCssEdit
            id={props.element.id}
            value={breakpoint}
            setValue={(value) => {
              for (const key of Object.keys(value ?? {})) {
                const name = key as keyof ComponentCssProperty;
                (breakpoint as any)[name] = value![name];
              }
            }}
          />
        </div>
      ))}

      <Button
        className={s.AddBreakpoint}
        variant="outline"
        onClick={() => {
          const newRule: ComponentCssProperty = {
            id: props.element.id,
            condition: {
              breakpoint: "md",
            },
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            gap: "",
          };

          if (props.value) {
            props.value.push(newRule);
          } else {
            props.setValue([newRule]);
          }
        }}
      >
        {translations.addBreakpoint}
      </Button>
    </div>
  );
};
