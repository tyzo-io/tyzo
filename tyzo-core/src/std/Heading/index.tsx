export function Heading({
  size,
  children,
}: {
  size?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  children: string;
}) {
  const Tag = size ?? "h1";
  return <Tag>{children}</Tag>;
}
