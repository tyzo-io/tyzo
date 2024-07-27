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
  parent?: { id: PageElementId; propertyName: string },
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

  addElement(elementContainer, data, parent, afterId);

  return data;
}

export function addElement(
  elementContainer: ElementContainer,
  element: PageElement,
  parent?: { id: PageElementId; propertyName: string },
  afterId?: PageElementId
) {
  elementContainer.elements[element.id] = element;

  if (parent) {
    const parentElement = elementContainer.elements[parent.id];
    if (!parentElement) {
      return;
    }
    if (!parentElement.childrenByProperty) {
      parentElement.childrenByProperty = {};
    }
    if (!parentElement.childrenByProperty[parent.propertyName]) {
      parentElement.childrenByProperty[parent.propertyName] = [];
    }
    if (afterId) {
      const index =
        parentElement.childrenByProperty[parent.propertyName]?.findIndex(
          (el) => el === afterId
        ) ?? -1;
      if (index >= 0) {
        parentElement.childrenByProperty[parent.propertyName]?.splice(
          index + 1,
          0,
          element.id
        );
      } else {
        parentElement.childrenByProperty[parent.propertyName]?.push(element.id);
      }
    } else {
      parentElement.childrenByProperty[parent.propertyName]?.push(element.id);
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
  elementContainer.elements[element.id]!.parent = parent;
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
  const parentChildren = el.parent
    ? elementContainer.elements[el.parent.id]?.childrenByProperty?.[
        el.parent.propertyName
      ]
    : elementContainer.children;
  const index = parentChildren?.findIndex((el) => el === id) ?? -1;
  el.parent = undefined;
  if (index >= 0) {
    parentChildren?.splice(index, 1);
  }
  elementContainer.elements[id] = undefined;
}

export function moveElement(
  elementContainer: ElementContainer,
  id: PageElementId,
  parent?: { id: PageElementId; propertyName: string },
  afterId?: PageElementId
) {
  const element = elementContainer.elements[id];
  if (!element) {
    return null;
  }
  const dupe = JSON.parse(JSON.stringify(element));
  const dupeParent = parent ? JSON.parse(JSON.stringify(parent)) : undefined;
  removeElement(elementContainer, id);
  addElement(elementContainer, dupe, dupeParent, afterId);
}

export function moveElementInParentBy(
  elementContainer: ElementContainer,
  id: PageElementId,
  by: number
) {
  const element = elementContainer.elements[id];
  if (!element) {
    return null;
  }
  const parentChildren = element.parent
    ? elementContainer.elements[element.parent.id]?.childrenByProperty?.[
        element.parent.propertyName
      ]
    : elementContainer.children;
  if (parent) {
    const index = parentChildren?.indexOf(element.id);
    if (
      typeof index === "number" &&
      index >= 0 &&
      index + by < (parentChildren?.length ?? 0) &&
      index + by >= 0
    ) {
      parentChildren!.splice(index, 1);
      parentChildren!.splice(index + by, 0, element.id);
    }
  }
}

export function moveElementDown(
  elementContainer: ElementContainer,
  id: PageElementId
) {
  moveElementInParentBy(elementContainer, id, 1);
}

export function moveElementUp(
  elementContainer: ElementContainer,
  id: PageElementId
) {
  moveElementInParentBy(elementContainer, id, -1);
}

export function duplicateElement(
  elementContainer: ElementContainer,
  id: PageElementId,
  newParent?: { id: PageElementId; propertyName: string }
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
  if (dupe.childrenByProperty) {
    dupe.childrenByProperty = {};
  }
  addElement(elementContainer, dupe, dupe.parent, id);
  for (const childPropName of Object.keys(element.childrenByProperty ?? {})) {
    for (const child of element.childrenByProperty?.[childPropName] ?? []) {
      duplicateElement(elementContainer, child, {
        id: dupe.id,
        propertyName: childPropName,
      });
    }
  }
  return dupe;
}

// export function copyElementToClipboard(
//   elementContainer: ElementContainer,
//   id: PageElementId,
// ) {
//   const element = elementContainer.elements[id];
//   if (!element) {
//     return;
//   }

//   localStorage.setItem('tyzo:clipboard', dupe)
// }

// export async function pasteElementFromClipboard(
//   elementContainer: ElementContainer,
//   newParent: PageElementId
// ) {
//   const id = localStorage.getItem('tyzo:clipboard')
//   if (!id) {
//     return
//   }

//   const element = elementContainer.elements[id];
//   if (!element) {
//     return;
//   }
//   const dupe = JSON.parse(JSON.stringify(element)) as PageElement;
//   dupe.id = randomId();
//   if (newParent) {
//     dupe.parent = newParent;
//   }
//   if (dupe.children) {
//     dupe.children = [];
//   }
//   addElement(elementContainer, dupe, dupe.parent, id);
//   for (const child of element.children ?? []) {
//     duplicateElement(elementContainer, child, dupe.id);
//   }
//   return dupe;
// }
