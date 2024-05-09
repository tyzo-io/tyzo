import type { DataModel, FileStore } from "./types";
import type { Data } from '@measured/puck'

export type Space = {
  id: string;
  name: string;
};

export type User = {
  id: string;
  email?: string | undefined | null;
  name?: string | undefined | null;
  avatarUrl?: string | undefined | null;
};

export type Page = {
  id: string;
  treeId: string;
  title: string;
  path: string;
  content: Data;
};

export type Tree = {
  id: string;
  alias?: string;
};

export type Permission = {
  id: string;
  userId: string;
  permission: "read" | "write";
  scope: "everything" | "pages" | "permissions" | "space_details" | "trees";
  // filters
};

export type Authentication = {
  getSession(): Promise<{ user?: User } | null>;
  saveSession(session: any): Promise<void>;
  login(): Promise<void>;
  logout(): Promise<void>;
};

export interface TyzoConfig {
  // modelStore: ModelStore<{ Page: Page; User: User }>;
  spaceId: string;
  spaces: Pick<DataModel<Space>, "get" | "update">;
  pages: DataModel<Page>;
  trees: DataModel<Tree>;
  users: {
    list: () => Promise<{ data: { user: User; permissions: Permission[] }[] }>;
    get: DataModel<User>["get"];
    update: DataModel<User>["update"];
    remove: DataModel<User>["remove"];
    add: (
      email: string,
      permission: "read" | "write",
      scope: "everything" | "pages" | "permissions" | "space_details" | "trees"
    ) => Promise<{ user: User }>;
    addPermission: (permission: Permission) => Promise<void>;
    removePermission: (permission: Permission) => Promise<void>;
    updatePermission: (permission: Permission) => Promise<void>;
  };
  // permissions: Pick<DataModel<Permission>, "list">;
  // users: Pick<DataModel<User>, "list">;
  authentication: Authentication;
  fileStore: FileStore;
}
