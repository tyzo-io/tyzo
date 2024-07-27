import type { DataModel, FileStore } from "./types";
import type { ElementContainer } from "@tyzo/page-editor";

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
  content: ElementContainer;
};

export type EmailTemplate = {
  id: string;
  treeId: string;
  title: string;
  subject: string;
  content: ElementContainer;
};

export type Tree = {
  id: string;
  alias?: string;
};

export type Permission = {
  id: string;
  userId: string;
  permission: "read" | "write";
  scope:
    | "everything"
    | "pages"
    | "email_templates"
    | "permissions"
    | "space_details"
    | "trees";
};

export type Authentication = {
  getSession(): Promise<{ user?: User } | null>;
  saveSession(session: any): Promise<void>;
  login(): Promise<void>;
  logout(): Promise<void>;
};

export interface TyzoConfig {
  spaceId: string;
  spaces: Pick<DataModel<Space>, "get" | "update">;
  pages: DataModel<Page>;
  emailTemplates: DataModel<EmailTemplate>;
  trees: DataModel<Tree>;
  users: {
    list: () => Promise<{ data: { user: User; permissions: Permission[] }[] }>;
    get: DataModel<User>["get"];
    update: DataModel<User>["update"];
    remove: DataModel<User>["remove"];
    add: (
      email: string,
      permission: "read" | "write",
      scope:
        | "everything"
        | "pages"
        | "email_templates"
        | "permissions"
        | "space_details"
        | "trees"
    ) => Promise<{ user: User }>;
    addPermission: (permission: Permission) => Promise<void>;
    removePermission: (permission: Permission) => Promise<void>;
    updatePermission: (permission: Permission) => Promise<void>;
  };
  authentication: Authentication;
  fileStore: FileStore;
}
