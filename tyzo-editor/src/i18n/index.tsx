import React, { createContext, useContext } from "react";

export type Translations = {
  components: string;
  content: string;
  containerEmpty: string;
  emptyPageInfo: string;
  dropHere: string;

  saved: string;
  saving: string;
  unsavedChanges: string;

  text: string;
  fontSize: string;
  textAlign: string;
  fontWeight: string;
  layout: string;
  size: string;
  width: string;
  height: string;
  minWidth: string;
  minHeight: string;
  maxWidth: string;
  maxHeight: string;
  border: string;
  roundness: string;
  shadow: string;
  custom: string;
  customStyle: string;

  none: string;
  small: string;
  medium: string;
  large: string;
  extraLarge: string;
  extraExtraLarge: string;
  left: string;
  center: string;
  right: string;
  lighter: string;
  normal: string;
  bold: string;
  bolder: string;
  margin: string;
  padding: string;
  display: string
  flexStart: string
  flexEnd: string
  baseline: string
  stretch: string
  block: string
  flex: string
  inline: string
  inlineBlock: string
  flexDirection: string
  row: string
  column: string
  rowReverse: string
  columnReverse: string
  spaceBetween: string
  spaceEvenly: string
  justifyContent: string
  alignItems: string
  gap: string

  remove: string;
  removeCondition: string;
  addCondition: string;
  breakpoint: string;

  mobileScreenSize: string;
  tabletScreenSize: string;
  desktopScreenSize: string;
  editTemplate: string;
  editing: string;
  template: string;
  style: string;
};

export const en: Translations = {
  components: "Components",
  content: "Content",
  containerEmpty: "This {{}} is empty",
  emptyPageInfo: "Drag and drop elements from the left side here.",
  dropHere: "Drop {{}}elements here",

  saved: "Saved",
  saving: "Saving...",
  unsavedChanges: "Unsaved Changes",

  text: "Text",
  fontSize: "Font Size",
  textAlign: "Text Align",
  fontWeight: "Font Weight",
  layout: "Layout",
  size: "Size",
  width: "Width",
  height: "Height",
  minWidth: "Min Width",
  minHeight: "Min Height",
  maxWidth: "Max Width",
  maxHeight: "Max Height",
  border: "Border",
  roundness: "Roundness",
  shadow: "Shadow",
  custom: "Custom",
  customStyle: "Custom Style",

  margin: "Margin",
  padding: "Padding",
  display: "Display",
  flexStart: "Flex Start",
  flexEnd: "Flex End",
  baseline: "Baseline",
  stretch: "Stretch",
  block: "Block",
  flex: "Flex",
  inline: "Inline",
  inlineBlock: "Inline Block",
  flexDirection: "Flex Direction",
  row: "Row",
  column: "Column",
  rowReverse: "Row Reverse",
  columnReverse: "Column Reverse",
  spaceBetween: "Space Between",
  spaceEvenly: "Space Evenly",
  justifyContent: "Justify Content",
  alignItems: "Align Items",
  gap: "Gap",

  none: "None",
  small: "Small",
  medium: "Medium",
  large: "Large",
  extraLarge: "Extra Large",
  extraExtraLarge: "Extra Extra Large",
  left: "Left",
  center: "Center",
  right: "Right",
  lighter: "Lighter",
  normal: "Normal",
  bold: "Bold",
  bolder: "Bolder",

  remove: "Remove",
  addCondition: "Add Condition",
  removeCondition: "Remove Condition",
  breakpoint: "Breakpoint",

  mobileScreenSize: "Mobile screen size",
  tabletScreenSize: "Tablet screen size",
  desktopScreenSize: "Desktop screen size",
  editTemplate: "Edit Template",
  editing: "Editing",
  template: "Template",
  style: "Style",
};

const I18nContext = createContext({
  translations: en,
});

export function I18nProvider({
  children,
  translations,
}: {
  children: React.ReactNode;
  translations?: Translations;
}) {
  return (
    <I18nContext.Provider value={{ translations: translations ?? en }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslations() {
  const { translations } = useContext(I18nContext);
  return {
    translations,
  };
}
