import { cn } from "@/lib/utils";

const sizes = {
  h1: "text-5xl",
  h2: "text-4xl",
  h3: "text-3xl",
  h4: "text-2xl",
  h5: "text-xl",
  h6: "text-lg",
};

export function Heading({
  size,
  children,
}: {
  size?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  children: string;
}) {
  const Tag = size ?? "h1";
  return <Tag className={cn(sizes[size ?? "h1"], "font-bold")}>{children}</Tag>;
}
