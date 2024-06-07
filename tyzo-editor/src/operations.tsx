import {
  ComponentInfo,
  ElementContainer,
  PageElement,
  PageElementId,
} from "./types";
import { randomId } from "./util/id";

export function addNewElement(
  elementContainer: ElementContainer,
  Component: ComponentInfo,
  parentId?: PageElementId,
  afterId?: PageElementId
) {
  const data: PageElement = {
    id: randomId(),
    componentId: Component.id,
    // data: Component.defaultData ?? ({} as Record<string, any>),
    data: Object.values(Component.properties ?? {}).reduce(
      (all, property) =>
        Object.assign(
          all,
          "defaultData" in property
            ? { [property.name]: property.defaultData }
            : {}
        ),
      {}
    ),
  };

  // for (const key of Object.keys(Comp?.Editor?.properties.objectFields ?? {})) {
  //   if (
  //     Comp?.Editor?.properties.objectFields?.[key] &&
  //     "defaultValue" in Comp?.Editor?.properties.objectFields?.[key]
  //   ) {
  //     data.data[key] =
  //       Comp?.Editor?.properties.objectFields?.[key].defaultValue;
  //   }
  // }

  addElement(elementContainer, data, parentId, afterId);

  return data;
}

export function addElement(
  elementContainer: ElementContainer,
  element: PageElement,
  parentId?: PageElementId,
  afterId?: PageElementId
) {
  elementContainer.elements[element.id] = element;

  if (parentId) {
    const parent = elementContainer.elements[parentId];
    if (!parent) {
      return;
    }
    if (!parent.children) {
      parent.children = [];
    }
    if (afterId) {
      const index = parent.children?.findIndex((el) => el === afterId) ?? -1;
      if (index >= 0) {
        parent.children?.splice(index + 1, 0, element.id);
      } else {
        parent.children?.push(element.id);
      }
    } else {
      parent.children?.push(element.id);
    }
  } else {
    if (afterId) {
      const index = elementContainer.children.findIndex((el) => el === afterId);
      if (index >= 0) {
        elementContainer.children.splice(index + 1, 0, element.id);
      } else {
        elementContainer.children.push(element.id);
      }
    } else {
      elementContainer.children.push(element.id);
    }
  }
  elementContainer.elements[element.id]!.parent = parentId;
}

export function removeElement(
  elementContainer: ElementContainer,
  id: PageElementId
) {
  // TODO should also remove children

  const el = elementContainer.elements[id];
  if (!el) {
    return;
  }
  const parent = el.parent
    ? elementContainer.elements[el.parent]
    : elementContainer;
  el.parent = undefined;
  const index = parent?.children?.findIndex((el) => el === id) ?? -1;
  if (index >= 0) {
    parent?.children?.splice(index, 1);
  }
  elementContainer.elements[id] = undefined;
}

export function moveElement(
  elementContainer: ElementContainer,
  id: PageElementId,
  parentId?: PageElementId,
  afterId?: PageElementId
) {
  const element = elementContainer.elements[id];
  if (!element) {
    return null;
  }
  const dupe = JSON.parse(JSON.stringify(element));
  removeElement(elementContainer, id);
  addElement(elementContainer, dupe, parentId, afterId);
}

export function duplicateElement(
  elementContainer: ElementContainer,
  id: PageElementId,
  newParent?: PageElementId
) {
  const element = elementContainer.elements[id];
  if (!element) {
    return;
  }
  const dupe = JSON.parse(JSON.stringify(element)) as PageElement;
  dupe.id = randomId();
  if (newParent) {
    dupe.parent = newParent;
  }
  if (dupe.children) {
    dupe.children = [];
  }
  addElement(elementContainer, dupe, dupe.parent, id);
  for (const child of element.children ?? []) {
    duplicateElement(elementContainer, child, dupe.id);
  }
}