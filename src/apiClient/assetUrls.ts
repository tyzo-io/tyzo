export function makeAssetUrl(
  baseUrl: string,
  filepath: string,
  options?: {
    width?: number;
    height?: number;
    format?: "avif" | "webp" | "jpeg" | "png";
    quality?: number;
    fit?: "contain" | "cover" | "fill" | "inside" | "outside" | undefined;
    position?: number | undefined;
    background?: string | undefined;
    withoutEnlargement?: boolean | undefined;
    withoutReduction?: boolean | undefined;
    skipVector?: boolean
  }
) {
  if (options?.skipVector && filepath.endsWith(".svg")) {
    return `${baseUrl}/assets/${filepath}`;
  }
  const query = new URLSearchParams();
  if (options?.width) query.set("width", options.width.toString());
  if (options?.height) query.set("height", options.height.toString());
  if (options?.format) query.set("format", options.format);
  if (options?.quality) query.set("quality", options.quality.toString());
  if (options?.fit) query.set("fit", options.fit);
  if (options?.position) query.set("position", options.position.toString());
  if (options?.background) query.set("background", options.background);
  if (options?.withoutEnlargement) query.set("withoutEnlargement", "true");
  if (options?.withoutReduction) query.set("withoutReduction", "true");
  if (query.toString()) {
    return `${baseUrl}/assets/${filepath}?${query.toString()}`;
  }
  return `${baseUrl}/assets/${filepath}`;
}
