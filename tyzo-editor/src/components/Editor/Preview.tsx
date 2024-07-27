import { ReactNode, forwardRef, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type EditorPreviewProps = JSX.IntrinsicElements["iframe"] & {
  // stylesheets?: Array<string>;
  children: ReactNode;
  head: ReactNode;
  getScale: () => number;
  maxWidth: string;
};

export const EditorPreview = forwardRef<HTMLIFrameElement, EditorPreviewProps>(
  ({ children, head, getScale, maxWidth, ...rest }, ref) => {
    const [liveRef, setLiveRef] = useState<HTMLIFrameElement | null>(null);

    // const headContent = useMemo(
    //   () => stylesToReactNode(stylesheets, head),
    //   [head]
    // );

    const bodyElement = liveRef?.contentWindow?.document?.body;
    const headElement = liveRef?.contentWindow?.document?.head;

    useEffect(() => {
      if (bodyElement) {
        const wheelListener = (e: WheelEvent) => {
          e.preventDefault();
          e.stopImmediatePropagation();
          const dp = liveRef.getBoundingClientRect();
          const scale = getScale();
          const dx = dp.left;
          const dy = dp.top;
          const newEvent = new WheelEvent("wheel", {
            bubbles: e.bubbles,
            cancelable: e.cancelable,
            deltaX: e.deltaX,
            deltaY: e.deltaY,
            deltaZ: e.deltaZ,
            deltaMode: e.deltaMode,
            clientX: e.clientX * scale + dx,
            clientY: e.clientY * scale + dy,
          });
          liveRef.dispatchEvent(newEvent);
        };
        const keydownListener = (e: KeyboardEvent) => {
          const newEvent = new KeyboardEvent(e.type, {
            bubbles: e.bubbles,
            cancelable: e.cancelable,
            code: e.code,
            keyCode: e.keyCode,
            shiftKey: e.shiftKey,
            altKey: e.altKey,
            metaKey: e.metaKey,
            key: e.key,
            location: e.location,
            isComposing: e.isComposing,
            repeat: e.repeat,
          });
          liveRef.dispatchEvent(newEvent);
        };
        const mouseListener = (event: MouseEvent) => {
          const dp = liveRef.getBoundingClientRect();
          const scale = getScale();
          const dx = dp.left;
          const dy = dp.top;

          const newEvent = new MouseEvent(event.type, {
            bubbles: event.bubbles,
            cancelable: event.cancelable,
            clientX: event.clientX * scale + dx,
            clientY: event.clientY * scale + dy,
            screenX: event.screenX * scale + dx,
            screenY: event.screenY * scale + dy,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            altKey: event.altKey,
            metaKey: event.metaKey,
            button: event.button,
          });
          liveRef.dispatchEvent(newEvent);
        };
        const touchListener = (event: TouchEvent) => {
          const dp = liveRef.getBoundingClientRect();
          const scale = getScale();
          const dx = dp.left;
          const dy = dp.top;

          const newEvent = new TouchEvent(event.type, {
            bubbles: event.bubbles,
            cancelable: event.cancelable,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            altKey: event.altKey,
            metaKey: event.metaKey,
            changedTouches: [...event.changedTouches].map(
              (touch) =>
                new Touch({
                  identifier: touch.identifier,
                  screenX: touch.screenX * scale + dx,
                  screenY: touch.screenY * scale + dy,
                  clientX: touch.clientX * scale + dx,
                  clientY: touch.clientY * scale + dy,
                  target: liveRef,
                  radiusX: touch.radiusX,
                  radiusY: touch.radiusY,
                  rotationAngle: touch.rotationAngle,
                  force: touch.force,
                })
            ),
            touches: [...event.touches].map(
              (touch) =>
                new Touch({
                  identifier: touch.identifier,
                  screenX: touch.screenX * scale + dx,
                  screenY: touch.screenY * scale + dy,
                  clientX: touch.clientX * scale + dx,
                  clientY: touch.clientY * scale + dy,
                  target: liveRef,
                  radiusX: touch.radiusX,
                  radiusY: touch.radiusY,
                  rotationAngle: touch.rotationAngle,
                  force: touch.force,
                })
            ),
          });
          liveRef.dispatchEvent(newEvent);
        };
        bodyElement.addEventListener("wheel", wheelListener, {
          passive: false,
        });
        bodyElement.addEventListener("keydown", keydownListener, {
          passive: false,
        });
        ["mousedown", "mousemove", "mouseup", "dblclick"].forEach(
          (eventName) => {
            bodyElement.addEventListener(
              eventName as "mousedown" | "mousemove" | "mouseup" | "dblclick",
              mouseListener,
              { passive: false }
            );
          }
        );
        ["touchstart", "touchmove", "touchend", "touchcancel"].forEach(
          (eventName) => {
            bodyElement.addEventListener(
              eventName as
                | "touchstart"
                | "touchmove"
                | "touchend"
                | "touchcancel",
              touchListener,
              { passive: false }
            );
          }
        );

        return () => {
          bodyElement.removeEventListener("wheel", wheelListener);
          bodyElement.removeEventListener("keydown", keydownListener);
          ["mousedown", "mousemove", "mouseup", "dblclick"].forEach(
            (eventName) => {
              bodyElement.removeEventListener(
                eventName as "mousedown" | "mousemove" | "mouseup" | "dblclick",
                mouseListener
              );
            }
          );
          ["touchstart", "touchmove", "touchend", "touchcancel"].forEach(
            (eventName) => {
              bodyElement.removeEventListener(
                eventName as
                  | "touchstart"
                  | "touchmove"
                  | "touchend"
                  | "touchcancel",
                touchListener
              );
            }
          );
        };
      }
    }, [bodyElement, liveRef, getScale]);

    const setIframeHeight = useCallback(() => {
      if (!liveRef?.contentWindow) {
        return;
      }
      // const rect = bodyElement?.getBoundingClientRect();
      // // console.log(bodyElement, rect)
      // const height = (rect?.height ?? 0) + (rect?.top ?? 0);
      // // liveRef.height = `${height}px`;

      let height = 0;
      // let height2 = 0;
      // let i =0
      for (const child of liveRef.contentWindow.document.body.children) {
        height += child.scrollHeight;
        //   const rect = child.getBoundingClientRect()
        //   height2 += rect.height;
        //   console.log(child, rect)
        //   if (i === 0) {
        //     height2 += rect.top
        //   }
        //   i++
      }
      // const finalHeight = height > height2 ? height : height2;

      // const height = liveRef.contentWindow?.document.body.scrollHeight;
      // const offset = rect?.top ?? 0;
      // console.log(rect, height2)

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
        // offset +
        (isNaN(marginTop) ? 0 : marginTop) +
        (isNaN(marginBottom) ? 0 : marginBottom) +
        20
      }px`;
      // liveRef.height = `${finalHeight + 1}px`;

      // console.log(finalHeight)
      // liveRef.height = `${2514 + 1}px`;
    }, [liveRef]);

    useEffect(() => {
      if (liveRef?.contentWindow && liveRef.contentDocument) {
        if (liveRef.contentWindow.document.body.parentElement) {
          liveRef.contentWindow.document.body.parentElement.style.height =
            "100%";
        }
        const config = { attributes: true, childList: true, subtree: true };

        const observer = new MutationObserver(() => {
          setIframeHeight();
        });

        observer.observe(liveRef.contentWindow.document.body, config);

        // const iframeBody = liveRef.contentDocument.body;

        // const ro = new ResizeObserver(function () {
        //   const newHeight = `${iframeBody.scrollHeight}px`;
        //   if (newHeight !== liveRef.style.height) {
        //     liveRef.style.height = `${iframeBody.scrollHeight}px`;
        //   }

        // });

        // ro.observe(iframeBody);

        return () => {
          observer.disconnect();
        };
      }
    }, [liveRef, bodyElement, setIframeHeight]);

    useEffect(() => {
      setIframeHeight();
    }, [maxWidth, setIframeHeight]);

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
        className="tyzo-preview-iframe"
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
