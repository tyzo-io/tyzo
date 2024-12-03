import React, { useEffect, useMemo } from "react";
import { BaseEditor } from "./BaseEditor";
import { initialConfig } from "./nodes";
import {
  TRANSFORMERS,
  $convertToMarkdownString,
  $convertFromMarkdownString,
} from "@lexical/markdown";
import { EditorState } from "lexical";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const markdownConfig = {
  ...initialConfig,
  namespace: "markdown-editor",
};

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const handleEditorChange = (editorState: EditorState) => {
    const markdownValue = editorState.read(() =>
      $convertToMarkdownString(TRANSFORMERS)
    );
    onChange(markdownValue);
  };

  const config = useMemo(() => {
    return {
      ...markdownConfig,
      editorState: value
        ? () => $convertFromMarkdownString(value, TRANSFORMERS)
        : undefined,
    };
  }, [])

  return (
    <BaseEditor config={config} onChange={handleEditorChange} isMarkdown>
      <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
    </BaseEditor>
  );
}
