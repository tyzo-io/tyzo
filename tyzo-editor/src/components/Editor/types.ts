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
};
