import React from "react";
import {
  DOMConversionMap,
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
} from "lexical";
import { DecoratorNode } from "lexical";
import { ImageInput } from "../../ImageInput";
import { Popover, PopoverTrigger, PopoverContent } from "../../ui/popover";
import { Button } from "../../ui/button";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

export function ImageNodeElement({
  url,
  alt,
  width,
  height,
  sizes,
  srcset,
  loading,
  onUpdate,
}: {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  sizes?: string;
  srcset?: string;
  loading?: "eager" | "lazy";
  onUpdate: (opts: { url: string; alt?: string }) => void;
}) {
  const [editor] = useLexicalComposerContext();
  return (
    <div className="relative">
      <img
        src={url}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        srcSet={srcset}
        loading={loading}
        className="max-w-full h-auto"
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="secondary" className="absolute top-0 right-0">
            ✎
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <ImageInput
            value={{ url, alt }}
            onChange={({ url, alt }) => {
              editor.update(() => {
                onUpdate({ url, alt });
                // const writableNode = this.getWritable();
                // writableNode.__url = url;
                // writableNode.__alt = alt;
              });
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export interface ImagePayload {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  sizes?: string;
  srcset?: string;
  loading?: "eager" | "lazy";
  key?: NodeKey;
}

export type SerializedImageNode = Omit<ImagePayload, "key"> & {
  type: "image";
  version: 1;
};

export class ImageNode extends DecoratorNode<JSX.Element> {
  __url: string;
  __alt?: string;
  __width?: number;
  __height?: number;
  __sizes?: string;
  __srcset?: string;
  __loading?: "eager" | "lazy";

  static getType(): string {
    return "image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode({
      url: node.__url,
      alt: node.__alt,
      width: node.__width,
      height: node.__height,
      sizes: node.__sizes,
      srcset: node.__srcset,
      loading: node.__loading,
      key: node.__key,
    });
  }

  constructor(payload: ImagePayload) {
    super(payload.key);
    this.__url = payload.url;
    this.__alt = payload.alt;
    this.__width = payload.width;
    this.__height = payload.height;
    this.__sizes = payload.sizes;
    this.__srcset = payload.srcset;
    this.__loading = payload.loading;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement("span");
    const theme = config.theme;
    const className = theme.image;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
  }

  updateDOM(): false {
    return false;
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const node = $createImageNode({
      url: serializedNode.url,
      alt: serializedNode.alt,
      width: serializedNode.width,
      height: serializedNode.height,
      sizes: serializedNode.sizes,
      srcset: serializedNode.srcset,
      loading: serializedNode.loading,
    });
    return node;
  }

  exportJSON(): SerializedImageNode {
    return {
      type: "image",
      version: 1,
      url: this.__url,
      alt: this.__alt,
      width: this.__width,
      height: this.__height,
      sizes: this.__sizes,
      srcset: this.__srcset,
      loading: this.__loading,
    };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: () => ({
        conversion: (node: HTMLElement) => {
          const src = node.getAttribute('src');
          const alt = node.getAttribute('alt');
          const width = node.getAttribute('width');
          const height = node.getAttribute('height');
          const sizes = node.getAttribute('sizes');
          const srcset = node.getAttribute('srcset');
          const loading = node.getAttribute('loading');
          if (!src) {
            return null;
          }
          const payload: ImagePayload = {
            url: src,
            alt: alt || undefined,
            width: width ? parseInt(width, 10) : undefined,
            height: height ? parseInt(height, 10) : undefined,
            sizes: sizes || undefined,
            srcset: srcset || undefined,
            loading: (loading as "eager" | "lazy") || undefined,
          };
          return {
            node: $createImageNode(payload),
          };
        },
        priority: 1,
      }),
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('img');
    element.setAttribute('src', this.__url);
    if (this.__alt) {
      element.setAttribute('alt', this.__alt);
    }
    if (this.__width) {
      element.setAttribute('width', this.__width.toString());
    }
    if (this.__height) {
      element.setAttribute('height', this.__height.toString());
    }
    if (this.__sizes) {
      element.setAttribute('sizes', this.__sizes);
    }
    if (this.__srcset) {
      element.setAttribute('srcset', this.__srcset);
    }
    if (this.__loading) {
      element.setAttribute('loading', this.__loading);
    }
    return { element };
  }

  decorate(): JSX.Element {
    return (
      <ImageNodeElement
        url={this.__url}
        alt={this.__alt}
        width={this.__width}
        height={this.__height}
        sizes={this.__sizes}
        srcset={this.__srcset}
        loading={this.__loading}
        onUpdate={({ url, alt }) => {
          const writableNode = this.getWritable();
          writableNode.__url = url;
          writableNode.__alt = alt;
        }}
      />
    );
    // const [editor] = useLexicalComposerContext();
    // return (
    //   <div className="relative">
    //     <img
    //       src={this.__url}
    //       alt={this.__alt}
    //       width={this.__width}
    //       height={this.__height}
    //       sizes={this.__sizes}
    //       srcSet={this.__srcset}
    //       loading={this.__loading}
    //       className="max-w-full h-auto"
    //     />
    //     <Popover>
    //       <PopoverTrigger asChild>
    //         <Button variant="secondary" className="absolute top-0 right-0">
    //           ✎
    //         </Button>
    //       </PopoverTrigger>
    //       <PopoverContent>
    //         <ImageInput
    //           value={{ url: this.__url, alt: this.__alt }}
    //           onChange={({ url, alt }) => {
    //             editor.update(() => {
    //               const writableNode = this.getWritable();
    //               writableNode.__url = url;
    //               writableNode.__alt = alt;
    //             });
    //           }}
    //         />
    //       </PopoverContent>
    //     </Popover>
    //   </div>
    // );
  }
}

export function $createImageNode(payload: ImagePayload): ImageNode {
  return new ImageNode(payload);
}

export function $isImageNode(
  node: LexicalNode | null | undefined
): node is ImageNode {
  return node instanceof ImageNode;
}
