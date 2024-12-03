import React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "../utils";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Bold, Italic, Underline, Strikethrough, ChevronDown, Link, Palette, Type } from "lucide-react";
import { $createHeadingNode, $createQuoteNode, HeadingTagType } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { LinkDialog } from "./LinkDialog";
import {
  $createLinkNode,
  $isLinkNode,
  TOGGLE_LINK_COMMAND,
  LinkNode,
} from "@lexical/link";

const COLORS = [
  { label: "Default", value: "inherit" },
  { label: "Red", value: "rgb(239, 68, 68)" },
  { label: "Orange", value: "rgb(249, 115, 22)" },
  { label: "Yellow", value: "rgb(234, 179, 8)" },
  { label: "Green", value: "rgb(34, 197, 94)" },
  { label: "Blue", value: "rgb(59, 130, 246)" },
  { label: "Purple", value: "rgb(168, 85, 247)" },
  { label: "Pink", value: "rgb(236, 72, 153)" },
];

const FONT_SIZES = [
  { label: "Small", value: "0.875em" },
  { label: "Normal", value: "1em" },
  { label: "Large", value: "1.25em" },
  { label: "Extra Large", value: "1.5em" },
];

function FloatingToolbarPlugin({ isMarkdown }: { isMarkdown?: boolean }) {
  const [editor] = useLexicalComposerContext();
  const [isText, setIsText] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [blockType, setBlockType] = useState<string>("paragraph");
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [color, setColor] = useState("inherit");
  const [fontSize, setFontSize] = useState("1em");

  const formatHeading = (headingSize: HeadingTagType) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(headingSize));
      }
    });
  };

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode());
      }
    });
  };

  const formatColor = (color: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const nodes = selection.getNodes();
        nodes.forEach((node) => {
          if ($isTextNode(node)) {
            const style = node.getStyle();
            const styles = style
              .split(";")
              .filter((s) => s.trim())
              .reduce((acc, curr) => {
                const [key, value] = curr.split(":").map((s) => s.trim());
                acc[key] = value;
                return acc;
              }, {} as Record<string, string>);

            styles["color"] = color;

            const newStyle = Object.entries(styles)
              .map(([key, value]) => `${key}: ${value}`)
              .join(";");

            node.setStyle(newStyle);
          }
        });
      }
    });
  };

  const formatFontSize = (fontSize: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const nodes = selection.getNodes();
        nodes.forEach((node) => {
          if ($isTextNode(node)) {
            const style = node.getStyle();
            const styles = style
              .split(";")
              .filter((s) => s.trim())
              .reduce((acc, curr) => {
                const [key, value] = curr.split(":").map((s) => s.trim());
                acc[key] = value;
                return acc;
              }, {} as Record<string, string>);

            styles["font-size"] = fontSize;

            const newStyle = Object.entries(styles)
              .map(([key, value]) => `${key}: ${value}`)
              .join(";");

            node.setStyle(newStyle);
          }
        });
      }
    });
  };

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const textContent = selection.getTextContent();
      if (!textContent) {
        setIsVisible(false);
        return;
      }

      const nativeSelection = window.getSelection();
      if (nativeSelection && nativeSelection.rangeCount > 0) {
        const range = nativeSelection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setPosition({
          top: rect.top - 40,
          left: rect.left + rect.width / 2,
        });

        setIsText(true);
        setIsBold(selection.hasFormat("bold"));
        setIsItalic(selection.hasFormat("italic"));
        setIsUnderline(selection.hasFormat("underline"));
        setIsStrikethrough(selection.hasFormat("strikethrough"));

        // Check if selection contains link
        const node = selection.getNodes()[0];
        const parent = node.getParent();
        if ($isLinkNode(parent)) {
          setIsLink(true);
          setLinkUrl(parent.getURL());
        } else {
          setIsLink(false);
          setLinkUrl("");
        }

        // Get block type
        const anchorNode = selection.anchor.getNode();
        const element =
          anchorNode.getKey() === "root"
            ? anchorNode
            : anchorNode.getTopLevelElement();
        const elementKey = element!.getKey();
        const elementDOM = editor.getElementByKey(elementKey);

        if (elementDOM) {
          if (elementDOM.tagName === "P") setBlockType("paragraph");
          else if (elementDOM.tagName === "H1") setBlockType("h1");
          else if (elementDOM.tagName === "H2") setBlockType("h2");
          else if (elementDOM.tagName === "H3") setBlockType("h3");
          else if (elementDOM.tagName === "BLOCKQUOTE") setBlockType("quote");
        }

        setTimeout(() => {
          setIsVisible(true);
        }, 0);
      }
    } else {
      setIsVisible(false);
    }
  }, [editor]);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar();
        return false;
      },
      1
    );
  }, [editor, updateToolbar]);

  const handleLinkSubmit = (url: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (url === "") {
          editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        } else {
          editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
        }
      }
    });
  };

  if (!mounted) return null;

  return createPortal(
    <>
      <div
        className={cn(
          "fixed z-50 flex items-center gap-1 px-1 py-1 bg-background border rounded shadow-lg transform -translate-x-1/2",
          "transition-opacity duration-200",
          isVisible && isText
            ? "opacity-100 -translate-y-2"
            : "opacity-0 -translate-y-2 pointer-events-none"
        )}
        style={{
          top: position.top + window.scrollY,
          left: position.left + window.scrollX,
        }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1 font-normal">
              {blockType === "paragraph" && "Normal"}
              {blockType === "h1" && "Heading 1"}
              {blockType === "h2" && "Heading 2"}
              {blockType === "h3" && "Heading 3"}
              {blockType === "quote" && "Quote"}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => formatParagraph()}>
              Normal
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => formatHeading("h1")}>
              Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => formatHeading("h2")}>
              Heading 2
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => formatHeading("h3")}>
              Heading 3
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => formatQuote()}>
              Quote
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-[1px] h-4 bg-border mx-1" />

        <Button
          variant={isBold ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
          }}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant={isItalic ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
          }}
        >
          <Italic className="h-4 w-4" />
        </Button>
        {!isMarkdown && (
          <Button
            variant={isUnderline ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
            }}
          >
            <Underline className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant={isStrikethrough ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
          }}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          variant={isLink ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => setShowLinkDialog(true)}
        >
          <Link className="h-4 w-4" />
        </Button>

        {!isMarkdown && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Palette className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {COLORS.map((color) => (
                  <DropdownMenuItem
                    key={color.value}
                    onClick={() => formatColor(color.value)}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: color.value }}
                      />
                      {color.label}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Type className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {FONT_SIZES.map((size) => (
                  <DropdownMenuItem
                    key={size.value}
                    onClick={() => formatFontSize(size.value)}
                  >
                    <span style={{ fontSize: size.value }}>{size.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>

      <LinkDialog
        isOpen={showLinkDialog}
        onClose={() => setShowLinkDialog(false)}
        onSubmit={handleLinkSubmit}
        url={linkUrl}
      />
    </>,
    document.body
  );
}

export default FloatingToolbarPlugin;
