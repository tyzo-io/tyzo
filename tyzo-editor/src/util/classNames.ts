export function classNames(...names: (string | null | undefined | false)[]) {
  return names.filter(Boolean).join(" ");
}
