import { NavBar } from "../NavBar";

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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useData } from "@/lib/useData";
import { useConfig } from "../Context";
import { Button } from "@/components/ui/button";
import type { User } from "@/tyzo-service/config";
import { Label } from "@radix-ui/react-label";
import s from "./style.module.css";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string(),
});

function ProfileForm({ user }: { user: User }) {
  const config = useConfig();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name ?? undefined,
    },
  });

  const handleSave = useCallback(async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    await config.users.update(user.id, values);
    setIsLoading(false);
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)} className={s.Form}>
        <FormField
          control={form.control}
          name="name"
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
        <div className={s.Row}>
          <Label className={s.Label}>Email</Label>
          <Input readOnly disabled value={user.email ?? ""} />
        </div>
        <Button type="submit" disabled={isLoading}>
          Save
        </Button>
      </form>
    </Form>
  );
}

export function Profile() {
  const config = useConfig();
  const { data: user } = useData(
    async () => config.authentication.getSession(),
    []
  );

  if (!user?.user) {
    return <div>Loading...</div>;
  }

  return (
    <div className={cn("tyzo", s.Container)}>
      <NavBar
        breadCrumbs={[
          {
            link: "/",
            label: "Home",
          },
          { link: "/profile", label: "Profile" },
        ]}
      />
      <h1 className={s.Title}>Profile</h1>
      <ProfileForm user={user?.user} />
    </div>
  );
}
