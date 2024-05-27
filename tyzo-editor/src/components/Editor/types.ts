import { ComponentInfo, Page } from "../../types";

export type Config = {
  components: Record<string, ComponentInfo>;
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
  save?: (data: Page) => Promise<void>;
};
