import { cn } from "@/lib/utils";

export function Stack({
  direction,
  isContainer,
  gap,
  children,
}: {
  direction: "horizontal" | "vertical";
  isContainer?: boolean;
  gap?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex",
        isContainer && "container",
        direction === "horizontal" ? "flex-row" : "flex-col"
      )}
      style={{
        gap,
      }}
    >
      {children}
    </div>
  );
}
