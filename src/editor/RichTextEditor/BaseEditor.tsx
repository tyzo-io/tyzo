import React from "react";
import { InitialConfigType, LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ReactNode } from "react";
import { cn } from "../utils";
import s from "./style.module.css";
import FloatingToolbarPlugin from "./FloatingToolbar";
import DraggableBlockPlugin from "./plugins/DraggableBlockPlugin";
import { OnChangePlugin } from "./plugins/OnChangePlugin";
import { EditorState, LexicalEditor } from "lexical";

export interface BaseEditorProps {
  config: InitialConfigType;
  children?: ReactNode;
  onChange: (data: EditorState, editor: LexicalEditor) => void;
  isMarkdown?: boolean;
}

export function BaseEditor({
  config,
  children,
  onChange,
  isMarkdown,
}: BaseEditorProps) {
  // const containerRef = React.useRef<HTMLDivElement>();
  const [container, setContainer] = React.useState<HTMLDivElement>();
  // console.log(containerRef.current);
  return (
    <LexicalComposer initialConfig={config}>
      <div
        className={cn(
          "editor-container prose relative w-full",
          s.editor,
          isMarkdown && s.markdown
        )}
        ref={(el) => {
          if (el) {
            if (container !== el) {
              setContainer(el);
            }
            // console.log(el)
            // containerRef.current = el;
          }
        }}
      >
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="editor-input border rounded-lg py-2 px-8 w-full min-h-[100px]" />
          }
          placeholder={
            <div className="editor-placeholder text-muted-foreground absolute top-2.5 left-8 pointer-events-none">
              Start typing...
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <OnChangePlugin onChange={onChange} />
        <FloatingToolbarPlugin isMarkdown={isMarkdown} />
        {container && <DraggableBlockPlugin anchorElem={container} />}
        {children}
      </div>
    </LexicalComposer>
  );
}
