import React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $insertNodes } from "lexical";
import { useEffect } from "react";
import { $createImageNode, ImageNode, ImagePayload } from "../nodes/ImageNode";

export const INSERT_IMAGE_COMMAND = "INSERT_IMAGE_COMMAND";

export function ImagePlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([ImageNode])) {
      throw new Error("ImagePlugin: ImageNode not registered on editor");
    }

    return editor.registerCommand(
      INSERT_IMAGE_COMMAND as any,
      (payload: ImagePayload) => {
        editor.update(() => {
          const imageNode = $createImageNode(payload);
          $insertNodes([imageNode]);
        });
        return true;
      },
      0
    );
  }, [editor]);

  return null;
}
