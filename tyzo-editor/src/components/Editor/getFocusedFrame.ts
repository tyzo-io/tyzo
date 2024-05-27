export function getFocusedFrame(selectedElement: HTMLElement) {
  let frame:
    | { top: number; width: number; left: number; height: number }
    | undefined;
  const rootElement = document.querySelector(".tyzo-page-container");
  if (rootElement && selectedElement) {
    const rect = selectedElement.getBoundingClientRect();
    const rootRect = rootElement.getBoundingClientRect();
    const transform = rootElement.parentElement?.style.transform;
    const scaleString = transform?.match(/matrix\(([\d+.]+)/)?.[1] ?? "1";
    let scale = parseFloat(scaleString);
    if (isNaN(scale) || scale === 0) {
      scale = 1;
    }

    frame = {
      top: (rect.top - rootRect.top) / scale,
      width: rect.width / scale,
      left: (rect.left - rootRect.left) / scale,
      height: rect.height / scale,
    };
  }
  return frame;
}
