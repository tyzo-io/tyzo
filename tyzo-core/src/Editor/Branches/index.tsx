import { useData } from "@/lib/useData";
import { useConfig } from "../Context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
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
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Edit, Trash } from "lucide-react";
import s from "./style.module.css";

const formSchema = z.object({
  alias: z.string(),
});

export function Branches() {
  const config = useConfig();
  const { data, refetch } = useData(() => config.trees.list(), []);
  const [branchIdToEdit, setBranchIdToEdit] = useState<string>();
  const [branchIdToDelete, setBranchIdToDelete] = useState<string>();
  const branchToEdit = data?.data.find(
    (branch) => branch.id === branchIdToEdit
  );
  const branchToDelete = data?.data.find(
    (branch) => branch.id === branchIdToDelete
  );

  return (
    <div>
      <h1 className={s.Title}>Branches</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>Branch</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.data.map((branch) => (
            <TableRow key={branch.id}>
              <TableCell width="1%">
                <div className={s.actions}>
                  <Button
                    size="icon"
                    variant="link"
                    onClick={() => setBranchIdToEdit(branch.id)}
                    aria-label="Edit"
                  >
                    <Edit className={s.Icon} />
                  </Button>
                  <Button
                    size="icon"
                    variant="link"
                    onClick={() => setBranchIdToDelete(branch.id)}
                    aria-label="Delete"
                  >
                    <Trash className={s.Icon} />
                  </Button>
                </div>
              </TableCell>
              <TableCell className={s.Email}>
                {branch.alias ?? branch.id}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={Boolean(branchToEdit)}
        onOpenChange={(open) => {
          if (!open) {
            setBranchIdToEdit(undefined);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{branchToEdit?.alias ?? branchToEdit?.id}</DialogTitle>
          </DialogHeader>
          <EditBranchForm
            id={branchIdToEdit}
            alias={branchToEdit?.alias}
            onUpdate={() => {
              refetch();
              setBranchIdToEdit(undefined);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(branchToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setBranchIdToDelete(undefined);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete {branchToDelete?.alias ?? branchToDelete?.id}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this branch?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={async () => {
                if (!branchIdToDelete) {
                  return;
                }
                await config.trees.remove(branchIdToDelete);
                refetch();
                setBranchIdToDelete(undefined);
              }}
            >
              Confirm delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button className={s.mt8}>Add Branch</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Branch</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <EditBranchForm id={undefined} onUpdate={refetch} alias={undefined} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EditBranchForm({
  id,
  alias,
  onUpdate,
}: {
  id: string | undefined;
  alias: string | undefined;
  onUpdate: () => void;
}) {
  const config = useConfig();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      alias: alias ?? "",
    },
  });

  const handleSave = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      setIsLoading(true);
      if (id) {
        await config.trees.update(id, {
          alias: values.alias,
        });
      } else {
        await config.trees.add({
          id: crypto.randomUUID(),
          alias: values.alias,
        });
      }
      setIsLoading(false);
      onUpdate();
    },
    [id, onUpdate, config.trees]
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)} className={s.spacey8}>
        <FormField
          control={form.control}
          name="alias"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Name" />
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
