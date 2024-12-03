import { calculateZoomLevel } from "@lexical/utils";
import { $getRoot, LexicalEditor } from "lexical";

export function isHTMLElement(x: unknown): x is HTMLElement {
  return x instanceof HTMLElement;
}

export class Point {
  private readonly _x: number;
  private readonly _y: number;

  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  public equals({ x, y }: Point): boolean {
    return this.x === x && this.y === y;
  }

  public calcDeltaXTo({ x }: Point): number {
    return this.x - x;
  }

  public calcDeltaYTo({ y }: Point): number {
    return this.y - y;
  }

  public calcHorizontalDistanceTo(point: Point): number {
    return Math.abs(this.calcDeltaXTo(point));
  }

  public calcVerticalDistance(point: Point): number {
    return Math.abs(this.calcDeltaYTo(point));
  }

  public calcDistanceTo(point: Point): number {
    return Math.sqrt(
      Math.pow(this.calcDeltaXTo(point), 2) +
        Math.pow(this.calcDeltaYTo(point), 2)
    );
  }
}

export function isPoint(x: unknown): x is Point {
  return x instanceof Point;
}

type ContainsPointReturn = {
  result: boolean;
  reason: {
    isOnTopSide: boolean;
    isOnBottomSide: boolean;
    isOnLeftSide: boolean;
    isOnRightSide: boolean;
  };
};

export class Rect {
  private readonly _left: number;
  private readonly _top: number;
  private readonly _right: number;
  private readonly _bottom: number;

  constructor(left: number, top: number, right: number, bottom: number) {
    const [physicTop, physicBottom] =
      top <= bottom ? [top, bottom] : [bottom, top];

    const [physicLeft, physicRight] =
      left <= right ? [left, right] : [right, left];

    this._top = physicTop;
    this._right = physicRight;
    this._left = physicLeft;
    this._bottom = physicBottom;
  }

  get top(): number {
    return this._top;
  }

  get right(): number {
    return this._right;
  }

  get bottom(): number {
    return this._bottom;
  }

  get left(): number {
    return this._left;
  }

  get width(): number {
    return Math.abs(this._left - this._right);
  }

  get height(): number {
    return Math.abs(this._bottom - this._top);
  }

  public equals({ top, left, bottom, right }: Rect): boolean {
    return (
      top === this._top &&
      bottom === this._bottom &&
      left === this._left &&
      right === this._right
    );
  }

  public contains({ x, y }: Point): ContainsPointReturn;
  public contains({ top, left, bottom, right }: Rect): boolean;
  public contains(target: Point | Rect): boolean | ContainsPointReturn {
    if (isPoint(target)) {
      const { x, y } = target;

      const isOnTopSide = y < this._top;
      const isOnBottomSide = y > this._bottom;
      const isOnLeftSide = x < this._left;
      const isOnRightSide = x > this._right;

      const result =
        !isOnTopSide && !isOnBottomSide && !isOnLeftSide && !isOnRightSide;

      return {
        reason: {
          isOnBottomSide,
          isOnLeftSide,
          isOnRightSide,
          isOnTopSide,
        },
        result,
      };
    } else {
      const { top, left, bottom, right } = target;

      return (
        top >= this._top &&
        top <= this._bottom &&
        bottom >= this._top &&
        bottom <= this._bottom &&
        left >= this._left &&
        left <= this._right &&
        right >= this._left &&
        right <= this._right
      );
    }
  }

  public intersectsWith(rect: Rect): boolean {
    const { left: x1, top: y1, width: w1, height: h1 } = rect;
    const { left: x2, top: y2, width: w2, height: h2 } = this;
    const maxX = x1 + w1 >= x2 + w2 ? x1 + w1 : x2 + w2;
    const maxY = y1 + h1 >= y2 + h2 ? y1 + h1 : y2 + h2;
    const minX = x1 <= x2 ? x1 : x2;
    const minY = y1 <= y2 ? y1 : y2;
    return maxX - minX <= w1 + w2 && maxY - minY <= h1 + h2;
  }

  public generateNewRect({
    left = this.left,
    top = this.top,
    right = this.right,
    bottom = this.bottom,
  }): Rect {
    return new Rect(left, top, right, bottom);
  }

  static fromLTRB(
    left: number,
    top: number,
    right: number,
    bottom: number
  ): Rect {
    return new Rect(left, top, right, bottom);
  }

  static fromLWTH(
    left: number,
    width: number,
    top: number,
    height: number
  ): Rect {
    return new Rect(left, top, left + width, top + height);
  }

  static fromPoints(startPoint: Point, endPoint: Point): Rect {
    const { y: top, x: left } = startPoint;
    const { y: bottom, x: right } = endPoint;
    return Rect.fromLTRB(left, top, right, bottom);
  }

  static fromDOM(dom: HTMLElement): Rect {
    const { top, width, left, height } = dom.getBoundingClientRect();
    return Rect.fromLWTH(left, width, top, height);
  }
}

const Downward = 1;
const Upward = -1;
const Indeterminate = 0;

let prevIndex = Infinity;

function getCurrentIndex(keysLength: number): number {
  if (keysLength === 0) {
    return Infinity;
  }
  if (prevIndex >= 0 && prevIndex < keysLength) {
    return prevIndex;
  }

  return Math.floor(keysLength / 2);
}

function getTopLevelNodeKeys(editor: LexicalEditor): string[] {
  return editor.getEditorState().read(() => $getRoot().getChildrenKeys());
}

export function getBlockElement(
  anchorElem: HTMLElement,
  editor: LexicalEditor,
  event: MouseEvent,
  useEdgeAsDefault = false
): HTMLElement | null {
  const anchorElementRect = anchorElem.getBoundingClientRect();
  const topLevelNodeKeys = getTopLevelNodeKeys(editor);

  let blockElem: HTMLElement | null = null;

  editor.getEditorState().read(() => {
    if (useEdgeAsDefault) {
      const [firstNode, lastNode] = [
        editor.getElementByKey(topLevelNodeKeys[0]),
        editor.getElementByKey(topLevelNodeKeys[topLevelNodeKeys.length - 1]),
      ];

      const [firstNodeRect, lastNodeRect] = [
        firstNode?.getBoundingClientRect(),
        lastNode?.getBoundingClientRect(),
      ];

      if (firstNodeRect && lastNodeRect) {
        const firstNodeZoom = calculateZoomLevel(firstNode);
        const lastNodeZoom = calculateZoomLevel(lastNode);
        if (event.y / firstNodeZoom < firstNodeRect.top) {
          blockElem = firstNode;
        } else if (event.y / lastNodeZoom > lastNodeRect.bottom) {
          blockElem = lastNode;
        }

        if (blockElem) {
          return;
        }
      }
    }

    let index = getCurrentIndex(topLevelNodeKeys.length);
    let direction = Indeterminate;

    while (index >= 0 && index < topLevelNodeKeys.length) {
      const key = topLevelNodeKeys[index];
      const elem = editor.getElementByKey(key);
      if (elem === null) {
        break;
      }
      const zoom = calculateZoomLevel(elem);
      const point = new Point(event.x / zoom, event.y / zoom);
      const domRect = Rect.fromDOM(elem);
      const { marginTop, marginBottom } = getCollapsedMargins(elem);
      const rect = domRect.generateNewRect({
        bottom: domRect.bottom + marginBottom,
        left: anchorElementRect.left,
        right: anchorElementRect.right,
        top: domRect.top - marginTop,
      });

      const {
        result,
        reason: { isOnTopSide, isOnBottomSide },
      } = rect.contains(point);

      if (result) {
        blockElem = elem;
        prevIndex = index;
        break;
      }

      if (direction === Indeterminate) {
        if (isOnTopSide) {
          direction = Upward;
        } else if (isOnBottomSide) {
          direction = Downward;
        } else {
          // stop search block element
          direction = Infinity;
        }
      }

      index += direction;
    }
  });

  return blockElem;
}

export function getCollapsedMargins(elem: HTMLElement): {
  marginTop: number;
  marginBottom: number;
} {
  const getMargin = (
    element: Element | null,
    margin: "marginTop" | "marginBottom"
  ): number =>
    element ? parseFloat(window.getComputedStyle(element)[margin]) : 0;

  const { marginTop, marginBottom } = window.getComputedStyle(elem);
  const prevElemSiblingMarginBottom = getMargin(
    elem.previousElementSibling,
    "marginBottom"
  );
  const nextElemSiblingMarginTop = getMargin(
    elem.nextElementSibling,
    "marginTop"
  );
  const collapsedTopMargin = Math.max(
    parseFloat(marginTop),
    prevElemSiblingMarginBottom
  );
  const collapsedBottomMargin = Math.max(
    parseFloat(marginBottom),
    nextElemSiblingMarginTop
  );

  return { marginBottom: collapsedBottomMargin, marginTop: collapsedTopMargin };
}
