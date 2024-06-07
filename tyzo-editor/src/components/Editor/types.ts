import { ComponentInfo, Page, InputMap } from "../../types";

export type Config = {
  /**
   * The components that will be available in the editor
   */
  components: Record<string, ComponentInfo>;

  /**
   * Left header
   */
  headerLeft?: React.ReactNode;

  /**
   * Right header
   */
  headerRight?: React.ReactNode;

  /**
   * A component that wraps the contents. Must render `children`
   */
  contentWrapper?: (props: { children: React.ReactNode }) => JSX.Element;

  /**
   * Head element that will be added to the head
   */
  head?: React.ReactNode | undefined;

  /**
   * This is called any time the data changes
   */
  onChange?: (data: Page) => void;

  /**
   * Whether to automatically save the page after changes. Defaults to true.
   */
  shouldAutoSave?: boolean;

  /**
   * Save callback when auto saving
   */
  save?: (data: Page) => Promise<void>;

  /**
   * Additional inputs that can be used in the component properties
   */
  additionalInputs?: InputMap;

  /**
   * A function used for string interpolation
   */
  tepmlateFunction?: (template: string, props: Record<string, any>) => string;
};
