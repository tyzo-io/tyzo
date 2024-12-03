// import { useState } from "react";
// import { LexicalComposer } from "@lexical/react/LexicalComposer";
// import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
// import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
// import { TRANSFORMERS } from "@lexical/markdown";
import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
// import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
// import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
// import {
//   AnchoredThreads,
//   FloatingComposer,
//   FloatingThreads,
//   liveblocksConfig,
//   LiveblocksPlugin,
//   useIsEditorReady,
// } from "@liveblocks/react-lexical";
// import { ClientSideSuspense, useThreads } from "@liveblocks/react";
// import DraggableBlockPlugin from "../plugins/DraggableBlockPlugin";
// import { PreserveSelectionPlugin } from "../plugins/PreserveSelectionPlugin";
// import { DocumentName } from "./DocumentName";
// import { FloatingToolbar } from "./FloatingToolbar";
import { ImageNode } from "./nodes/ImageNode";

export const initialConfig = {
  namespace: "tyzo-editor",
  nodes: [
    HorizontalRuleNode,
    CodeNode,
    LinkNode,
    ListNode,
    ListItemNode,
    HeadingNode,
    QuoteNode,
    ImageNode,
  ],
  onError: (error: unknown) => {
    console.error(error);
    throw error;
  },
  theme: {
    text: {
      bold: "tyzo-bold",
      italic: "tyzo-italic",
      underline: "tyzo-underline",
      strikethrough: "tyzo-strikethrough",
      color: "tyzo-color",
      fontSize: "tyzo-font-size",
    },
    image: "tyzo-image",
  },
};
