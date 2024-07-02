import type { TyzoConfig } from "./tyzo-service/config";
import { createClient } from "@supabase/supabase-js";
import type { Database, Json } from "./tyzo-service/schema";
import type { ElementContainer } from "@tyzo/page-editor";

export * from "./tyzo-service/config";

// const supabaseUrl = "http://127.0.0.1:54321";
// const authUrl = "http://localhost:4321/login";
// const anonKey =
  // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
const supabaseUrl = "https://tufhcjjqwiplrbbxelod.supabase.co";
const authUrl = "https://www.tyzo.io/login";
const anonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1Zmhjampxd2lwbHJiYnhlbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA2ODE1NzYsImV4cCI6MjAyNjI1NzU3Nn0.7n2rh94fVpFeTKjRUsHG3X0E_8baIJTuxWO7m4RjNao";

export const serviceClientConfig = ({
  spaceId,
  backendUrl,
  anonKey: anonKeyFromProps,
}: {
  spaceId: string;
  backendUrl?: string;
  anonKey?: string;
}) => {
  const supabase = createClient<Database>(
    backendUrl ?? supabaseUrl,
    anonKeyFromProps ?? anonKey
  );

  const config: TyzoConfig = {
    spaceId,
    spaces: {
      async get(id) {
        const query = supabase.from("spaces").select("*").eq("id", id).single();

        const { data } = await query;
        if (!data) {
          throw new Error("Space not found");
        }

        return {
          id: data.id,
          name: data.name,
        };
      },
      async update(id, user) {
        const { error } = await supabase
          .from("spaces")
          .update({
            name: user.name,
          })
          .eq("id", id);
        if (error) {
          throw new Error("Could not save space");
        }
      },
    },
    users: {
      async list() {
        const { data: permissionsData } = await supabase
          .from("space_permissions")
          .select("*")
          .eq("space_id", spaceId);

        const permissions = permissionsData ?? [];

        const { data: users } = await supabase
          .from("user_profiles")
          .select("*")
          .in(
            "id",
            permissions.map((p) => p.user_id)
          );

        return {
          data:
            users?.map((user) => ({
              user: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatarUrl: user.avatar_url,
              },
              permissions: permissions
                .filter((p) => p.user_id === user.id)
                .map((p) => ({
                  id: p.id,
                  userId: p.user_id,
                  permission: p.permission,
                  scope: p.scope,
                })),
            })) ?? [],
        };
      },
      async get(id) {
        const query = supabase
          .from("user_profiles")
          .select("*")
          .eq("id", id)
          .single();

        const { data } = await query;
        if (!data) {
          throw new Error("User not found");
        }

        return {
          id: data.id,
          email: data.email,
          name: data.name,
          avatarUrl: data.avatar_url,
        };
      },
      async add(email, permission, scope) {
        const result = await supabase.functions.invoke("invite-users", {
          body: JSON.stringify({
            spaceId,
            email,
            permission,
            scope,
          }),
        });
        return result.data;
      },
      async addPermission(permission) {
        const { data } = await supabase
          .from("space_permissions")
          .insert({
            id: permission.id,
            space_id: spaceId,
            user_id: permission.userId,
            scope: permission.scope,
            permission: permission.permission,
          })
          .select()
          .single();
        if (!data) {
          throw new Error("Could not save permission");
        }
        //     return {
        //       id: data.id,
        //       userId: data.user_id,
        //       scope: data.scope,
        //       permission: data.permission,
        //     };
      },
      async removePermission(permission) {
        const { error } = await supabase
          .from("space_permissions")
          .delete()
          .eq("id", permission.id);
        if (error) {
          throw new Error("Could not delete permission");
        }
      },
      async updatePermission(permission) {
        const { error } = await supabase
          .from("space_permissions")
          .update({
            scope: permission.scope,
            permission: permission.permission,
          })
          .eq("id", permission.id);
        if (error) {
          throw new Error("Could not update permission");
        }
      },
      async update(id, user) {
        const { error } = await supabase
          .from("user_profiles")
          .update({
            name: user.name,
            avatar_url: user.avatarUrl,
          })
          .eq("id", id);
        if (error) {
          throw new Error("Could not save user");
        }
      },
      async remove(id) {
        // delete all permissions
        await supabase
          .from("space_permissions")
          .delete()
          .eq("user_id", id)
          .eq("space_id", spaceId);
      },
    },
    // permissions: {
    //   name: "Permissions",
    //   async list(options) {
    //     const query = supabase
    //       .from("space_permissions")
    //       .select("*")
    //       .eq("space_id", spaceId);
    //     // .eq("tree_id", treeId);

    //     if (options?.filters?.userId?.equals) {
    //       query.eq("user_id", options.filters.userId.equals);
    //     }

    //     const { data } = await query;

    //     return {
    //       data:
    //         data?.map((permission) => ({
    //           id: permission.id,
    //           userId: permission.user_id,
    //           scope: permission.scope,
    //           permission: permission.permission,
    //         })) ?? [],
    //     };
    //   },
    //   async get(id) {
    //     const query = supabase
    //       .from("space_permissions")
    //       .select("*")
    //       .eq("space_id", spaceId)
    //       .eq("id", id)
    //       .single();

    //     const { data } = await query;
    //     if (!data) {
    //       throw new Error("Permission not found");
    //     }

    //     return {
    //       id: data.id,
    //       userId: data.user_id,
    //       scope: data.scope,
    //       permission: data.permission,
    //     };
    //   },
    //   async add(permission) {
    //     const { data } = await supabase
    //       .from("space_permissions")
    //       .insert({
    //         id: permission.id,
    //         space_id: spaceId,
    //         user_id: permission.userId,
    //         scope: permission.scope,
    //         permission: permission.permission,
    //       })
    //       .select()
    //       .single();
    //     if (!data) {
    //       throw new Error("Could not save permission");
    //     }
    //     return {
    //       id: data.id,
    //       userId: data.user_id,
    //       scope: data.scope,
    //       permission: data.permission,
    //     };
    //   },
    //   async update(id, permission) {
    //     const { error } = await supabase
    //       .from("space_permissions")
    //       .update({
    //         scope: permission.scope,
    //         permission: permission.permission,
    //       })
    //       .eq("id", id)
    //       .eq("space_id", spaceId);
    //     if (error) {
    //       throw new Error("Could not save permission");
    //     }
    //   },
    //   async remove(id) {
    //     await supabase
    //       .from("space_permissions")
    //       .delete()
    //       .eq("id", id)
    //       .eq("space_id", spaceId);
    //   },
    // },
    pages: {
      name: "Page",
      async list(options) {
        const query = supabase
          .from("pages")
          .select("*")
          .eq("space_id", spaceId);
        // .eq("tree_id", treeId);

        if (options?.filters?.treeId?.equals) {
          query.eq("tree_id", options.filters.treeId.equals);
        }

        const { data } = await query;

        return {
          data:
            data?.map((page) => ({
              id: page.id,
              treeId: page.tree_id,
              path: page.path,
              title: page.title,
              content: (page.content ?? {}) as unknown as ElementContainer,
            })) ?? [],
        };
      },
      async get(id) {
        const query = supabase
          .from("pages")
          .select("*")
          .eq("space_id", spaceId)
          .eq("id", id)
          .single();

        const { data } = await query;
        if (!data) {
          throw new Error("Page not found");
        }

        return {
          id: data.id,
          treeId: data.tree_id,
          path: data.path,
          title: data.title,
          content: (data.content ?? {}) as unknown as ElementContainer,
        };
      },
      async add(page) {
        const { data } = await supabase
          .from("pages")
          .insert({
            id: page.id,
            space_id: spaceId,
            tree_id: page.treeId,
            path: page.path,
            title: page.title,
            content: page.content as unknown as Json,
          })
          .select()
          .single();
        if (!data) {
          throw new Error("Could not save page");
        }
        return {
          id: data.id,
          treeId: data.tree_id,
          path: data.path,
          title: data.title,
          content: (data.content ?? {}) as unknown as ElementContainer,
        };
      },
      async update(id, page) {
        const { error } = await supabase
          .from("pages")
          .update({
            path: page.path,
            title: page.title,
            content: page.content as unknown as Json,
          })
          .eq("id", id)
          .eq("space_id", spaceId);
        if (error) {
          throw new Error("Could not save page");
        }
      },
      async remove(id) {
        await supabase
          .from("pages")
          .delete()
          .eq("id", id)
          .eq("space_id", spaceId);
      },
    },
    trees: {
      name: "Tree",
      async list(options) {
        const query = supabase
          .from("space_trees")
          .select("*")
          .eq("space_id", spaceId);
        if (options?.filters?.alias?.equals) {
          query.eq("alias", options.filters.alias.equals);
        }
        const { data } = await query;

        return {
          data:
            data?.map((tree) => ({
              id: tree.id,
              alias: tree.alias ?? undefined,
            })) ?? [],
        };
      },
      async get(id) {
        const query = supabase
          .from("space_trees")
          .select("*")
          .eq("space_id", spaceId)
          .eq("id", id)
          .single();

        const { data } = await query;
        if (!data) {
          throw new Error("Branch not found");
        }
        return {
          id: data.id,
          alias: data.alias ?? undefined,
        };
      },
      async add(tree) {
        const { data } = await supabase
          .from("space_trees")
          .insert({
            id: tree.id,
            space_id: spaceId,
            alias: tree.alias,
          })
          .select()
          .single();
        if (!data) {
          throw new Error("Could not save branch");
        }
        return {
          id: data.id,
          alias: data.alias ?? undefined,
        };
      },
      async update(id, tree) {
        const { error } = await supabase
          .from("space_trees")
          .update({
            alias: tree.alias,
          })
          .eq("id", id)
          .eq("space_id", spaceId);
        if (error) {
          throw new Error("Could not save branch");
        }
      },
      async remove(id) {
        await supabase
          .from("space_trees")
          .delete()
          .eq("id", id)
          .eq("space_id", spaceId);
      },
    },
    authentication: {
      async getSession() {
        const { data } = await supabase.auth.getUser();
        const { data: profile } = data.user
          ? await supabase
              .from("user_profiles")
              .select()
              .eq("id", data.user.id)
              .single()
          : { data: undefined };
        return {
          user: data.user
            ? {
                id: data.user.id,
                email: data.user.email,
                name: profile?.name,
              }
            : undefined,
        };
      },
      async login() {
        window.location.href = `${authUrl}?redirect=${encodeURIComponent(
          window.location.href.split("?")[0]
        )}`;
      },
      async saveSession(session) {
        await supabase.auth.setSession(JSON.parse(session));
      },
      async logout() {
        await supabase.auth.signOut();
      },
    },
    fileStore: {
      async add(key, file) {
        const fullKey = `${spaceId}/${key}`;
        const { data } = await supabase.storage
          .from("space_files")
          .upload(fullKey, file);
        if (!data) {
          throw new Error("Could not upload file");
        }

        const url = supabase.storage
          .from("space_files")
          .getPublicUrl(data.path);
        return { url: url.data.publicUrl };
      },
    },
  };
  return config;
};

export default serviceClientConfig;
