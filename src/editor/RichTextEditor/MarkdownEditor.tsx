import React, { useMemo } from "react";
import { BaseEditor } from "./BaseEditor";
import { initialConfig } from "./nodes";
import {
  TRANSFORMERS,
  $convertToMarkdownString,
  $convertFromMarkdownString,
  ElementTransformer,
} from "@lexical/markdown";
import { EditorState, LexicalNode } from "lexical";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { $createImageNode, $isImageNode, ImageNode } from "./nodes/ImageNode";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const IMAGE_REGEX = /!\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)/;

const IMAGE_TRANSFORMER: ElementTransformer = {
  dependencies: [ImageNode],
  export: (node: LexicalNode) => {
    if (!$isImageNode(node)) {
      return null;
    }
    const imageNode = node as ImageNode;
    const alt = imageNode.__alt || "";
    return `![${alt}](${imageNode.__url})`;
  },
  regExp: IMAGE_REGEX,
  type: "element",
  replace: (textNode, _1, match) => {
    const [_, alt, src] = match;
    const imageNode = $createImageNode({
      url: src,
      alt: alt || undefined,
    });
    textNode.replace(imageNode);
  },
};

const MARKDOWN_TRANSFORMERS = [...TRANSFORMERS, IMAGE_TRANSFORMER];

const markdownConfig = {
  ...initialConfig,
  namespace: "markdown-editor",
};

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const handleEditorChange = (editorState: EditorState) => {
    const markdownValue = editorState.read(() =>
      $convertToMarkdownString(MARKDOWN_TRANSFORMERS)
    );
    onChange(markdownValue);
  };

  const config = useMemo(() => {
    return {
      ...markdownConfig,
      editorState: value
        ? () => $convertFromMarkdownString(value, MARKDOWN_TRANSFORMERS)
        : undefined,
    };
  }, []);

  return (
    <BaseEditor config={config} onChange={handleEditorChange} isMarkdown>
      <MarkdownShortcutPlugin transformers={MARKDOWN_TRANSFORMERS} />
    </BaseEditor>
  );
}
