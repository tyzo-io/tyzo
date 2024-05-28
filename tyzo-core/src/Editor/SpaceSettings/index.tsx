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
import type { Space } from "@/tyzo-service/config";
import s from "./style.module.css";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string(),
});

function SpaceForm({ space }: { space: Space }) {
  const config = useConfig();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: space.name,
    },
  });

  const handleSave = useCallback(async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    await config.spaces.update(space.id, values);
    setIsLoading(false);
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)} className={s.From}>
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
        <Button type="submit" disabled={isLoading}>
          Save
        </Button>
      </form>
    </Form>
  );
}

export function SpaceSettings() {
  const config = useConfig();
  const { data: space } = useData(
    async () => config.spaces.get(config.spaceId),
    [config.spaceId]
  );

  if (!space) {
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
          { link: "/settings", label: "Settings" },
        ]}
      />
      <h1 className={s.Title}>Settings</h1>
      <SpaceForm space={space} />
    </div>
  );
}
