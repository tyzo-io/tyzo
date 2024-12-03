import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { EditorState, LexicalEditor } from "lexical";

interface OnChangePluginProps {
  onChange: (editorState: EditorState, editor: LexicalEditor) => void;
}

export function OnChangePlugin({ onChange }: OnChangePluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const unsubscribe = editor.registerUpdateListener(({ editorState }) => {
      onChange(editorState, editor);
    });
    return () => {
      unsubscribe();
    };
  }, [editor, onChange]);

  return null;
}
