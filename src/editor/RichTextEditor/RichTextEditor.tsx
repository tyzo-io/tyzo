import React from "react";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
// import { CodeHighlightPlugin } from '@lexical/react/LexicalCodeHighlightPlugin';
import { BaseEditor } from "./BaseEditor";
import { initialConfig } from "./nodes";
import { $getRoot, $insertNodes, EditorState, LexicalEditor } from "lexical";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { useMemo } from "react";
import { InitialConfigType } from "@lexical/react/LexicalComposer";

const richTextConfig = {
  ...initialConfig,
  namespace: "rich-text-editor",
  onError: (error: Error) => {
    console.error(error);
  },
};

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const handleEditorChange = (
    editorState: EditorState,
    editor: LexicalEditor
  ) => {
    editorState.read(() => {
      const htmlString = $generateHtmlFromNodes(editor);
      onChange(htmlString);
    });

  };
  const config = useMemo(() => {
    const config: InitialConfigType = {
      ...richTextConfig,
      editorState: value
        ? (editor) => {
            const parser = new DOMParser();
            const dom = parser.parseFromString(value, "text/html");
            const nodes = $generateNodesFromDOM(editor, dom);
            $getRoot().select();
            $insertNodes(nodes);
          }
        : undefined,
    };
    return config;
  }, []);

  return (
    <BaseEditor config={config} onChange={handleEditorChange}>
      <ListPlugin />
      <LinkPlugin />
      {/* <CodeHighlightPlugin /> */}
    </BaseEditor>
  );
}
