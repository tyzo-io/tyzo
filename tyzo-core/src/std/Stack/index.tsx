export function Stack({
  direction,
  gap,
  justifyContent,
  alignItems,
  children,
}: {
  id: string;
  direction: "horizontal" | "vertical";
  isContainer?: boolean;
  gap?: string;
  justifyContent:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-evenly";
  alignItems: "flex-start" | "flex-end" | "center" | "baseline" | "stretch";
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap,
        justifyContent,
        alignItems,
        flexDirection: direction === "horizontal" ? "row" : "column",
      }}
    >
      {children}
    </div>
  );
}
