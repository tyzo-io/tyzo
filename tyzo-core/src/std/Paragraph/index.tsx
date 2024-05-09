import { cn } from "@/lib/utils";

const aligns = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function Paragraph({
  children,
  textAlign,
}: {
  children: string;
  textAlign?: "left" | "center" | "right";
}) {
  return <p className={cn(textAlign && aligns[textAlign])}>{children}</p>;
}
