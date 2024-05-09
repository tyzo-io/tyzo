import { useData } from "@/lib/useData";
import { NavBar } from "./NavBar";
import { useConfig } from "./Context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { useCallback, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormLabel,
  FormField,
  FormItem,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Edit, Plus, X } from "lucide-react";
import type { Permission } from "@/tyzo-service/config";

const formSchema = z.object({
  email: z.string().email(),
  permission: z.enum(["read", "write"]),
  scope: z.enum(["everything", "pages", "permissions"]),
});

export function Team() {
  const config = useConfig();
  const { data, refetch } = useData(() => config.users.list(), []);
  const [userIdToEdit, setUserIdToEdit] = useState<string>();
  const userToEdit = data?.data.find((user) => user.user.id === userIdToEdit);

  return (
    <div className="container p-4">
      <NavBar
        breadCrumbs={[
          {
            link: "/",
            label: "Home",
          },
          { link: "/team", label: "Team" },
        ]}
      />
      <h1 className="text-3xl font-bold">Team</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>User</TableHead>
            <TableHead>Permissions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.data.map((user) => (
            <TableRow key={user.user.id}>
              <TableCell>
                <Button
                  size="icon"
                  variant="link"
                  onClick={() => setUserIdToEdit(user.user.id)}
                >
                  <Edit />
                </Button>
              </TableCell>
              <TableCell className="font-medium">{user.user.email}</TableCell>
              <TableCell>
                {user.permissions
                  .map((p) => `${p.permission} ${p.scope}`)
                  .join(", ")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={Boolean(userToEdit)}
        onOpenChange={(open) => {
          if (!open) {
            setUserIdToEdit(undefined);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{userToEdit?.user.email}</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            {userToEdit?.permissions.map((p) => (
              <div key={p.permission} className="flex items-center gap-2">
                <Select
                  value={p.permission}
                  onValueChange={async (value) => {
                    await config.users.updatePermission({
                      ...p,
                      permission: value as Permission["permission"],
                    });
                    refetch();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Permission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="write">Write</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={p.scope}
                  onValueChange={async (value) => {
                    await config.users.updatePermission({
                      ...p,
                      scope: value as Permission["scope"],
                    });
                    refetch();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everything">Everything</SelectItem>
                    <SelectItem value="pages">Pages</SelectItem>
                    <SelectItem value="permissions">Permissions</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="px-2"
                  onClick={async () => {
                    await config.users.removePermission(p);
                    refetch();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                if (!userToEdit) {
                  return;
                }
                const permission: Permission = {
                  id: crypto.randomUUID(),
                  userId: userToEdit.user.id,
                  permission: "read",
                  scope: "everything",
                };
                await config.users.addPermission(permission);
                refetch();
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="mt-8">Add User</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <AddUserForm onUpdate={refetch} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AddUserForm({ onUpdate }: { onUpdate: () => void }) {
  const config = useConfig();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      permission: "read",
      scope: "everything",
    },
  });

  const handleSave = useCallback(async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    await config.users.add(values.email, values.permission, values.scope);
    setIsLoading(false);
    onUpdate();
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Email" type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="permission"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Permission</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Permission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="write">Write</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scope"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Scope</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everything">Everything</SelectItem>
                    <SelectItem value="pages">Pages</SelectItem>
                    <SelectItem value="permissions">Permissions</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          Submit
        </Button>
      </form>
    </Form>
  );
}
