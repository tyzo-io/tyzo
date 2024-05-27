import { ReactNode, forwardRef, useState } from "react";
import { createPortal } from "react-dom";

type EditorCanvasFrameProps = JSX.IntrinsicElements["iframe"] & {
  // stylesheets?: Array<string>;
  children: ReactNode;
  head: ReactNode;
};

export const EditorCanvasFrame = forwardRef<
  HTMLIFrameElement,
  EditorCanvasFrameProps
>(({ children, head, ...rest }, ref) => {
  const [liveRef, setLiveRef] = useState<HTMLIFrameElement | null>(null);

  // const headContent = useMemo(
  //   () => stylesToReactNode(stylesheets, head),
  //   [head]
  // );

  const bodyElement = liveRef?.contentWindow?.document?.body;
  const headElement = liveRef?.contentWindow?.document?.head;

  return (
    <iframe
      style={{
        border: "none",
        display: "block",
        width: "100%",
        height: "100%",
        position: "relative",
      }}
      {...rest}
      ref={(el) => {
        setLiveRef(el);

        if (typeof ref === "function") {
          ref(el);
        } else if (ref) {
          ref.current = el;
        }
      }}
    >
      {children && bodyElement && createPortal(children, bodyElement)}
      {head && headElement && createPortal(head, headElement)}
    </iframe>
  );
});
