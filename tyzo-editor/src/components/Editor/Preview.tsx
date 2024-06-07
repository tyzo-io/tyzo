import { ReactNode, forwardRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type EditorPreviewProps = JSX.IntrinsicElements["iframe"] & {
  // stylesheets?: Array<string>;
  children: ReactNode;
  head: ReactNode;
};

export const EditorPreview = forwardRef<HTMLIFrameElement, EditorPreviewProps>(
  ({ children, head, ...rest }, ref) => {
    const [liveRef, setLiveRef] = useState<HTMLIFrameElement | null>(null);

    // const headContent = useMemo(
    //   () => stylesToReactNode(stylesheets, head),
    //   [head]
    // );

    const bodyElement = liveRef?.contentWindow?.document?.body;
    const headElement = liveRef?.contentWindow?.document?.head;

    useEffect(() => {
      function setIframeHeight() {
        if (!liveRef?.contentWindow) {
          return;
        }
        let height = 0;
        for (const child of liveRef.contentWindow.document.body.children) {
          height += child.scrollHeight;
        }
        // const height = liveRef.contentWindow?.document.body.scrollHeight;

        const window = liveRef.contentWindow;
        const marginTop = parseFloat(
          window
            .getComputedStyle(window.document.body, null)
            .getPropertyValue("margin-top") ?? 0
        );
        const marginBottom = parseFloat(
          window
            .getComputedStyle(window.document.body, null)
            .getPropertyValue("margin-bottom") ?? 0
        );
        liveRef.height = `${
          height +
          (isNaN(marginTop) ? 0 : marginTop) +
          (isNaN(marginBottom) ? 0 : marginBottom) +
          1
        }px`;
      }
      if (liveRef?.contentWindow) {
        const config = { attributes: true, childList: true, subtree: true };

        const observer = new MutationObserver(() => {
          setIframeHeight();
        });

        observer.observe(liveRef.contentWindow.document.body, config);

        return () => {
          observer.disconnect();
        };
      }
    }, [liveRef]);

    return (
      <iframe
        style={{
          border: "none",
          display: "block",
          width: "100%",
          // height: "100%",
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
  }
);
