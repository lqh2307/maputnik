import { parseStringXML } from "../../utils/Object";
import { XMLTreeNode } from "./Types";
import { nanoid } from "nanoid";

/** Creates a normalized XML tree node. */
export function createElementNode(option: XMLTreeNode = {}): XMLTreeNode {
  return {
    ...option,
    id: option.id ?? nanoid(),
    name: option.name ?? "node",
    value: option.value ?? "",
    type: option.type ?? "element",
    attributes: option.attributes ?? [],
    childrens: option.childrens ?? [],
  };
}

/** Converts a browser DOM node into the editable tree model. */
export function domNodeToTree(node: Node): XMLTreeNode {
  if (node.nodeType === Node.TEXT_NODE) {
    return createElementNode({
      name: "#text",
      type: "text",
      value: node.textContent ?? "",
    });
  }

  if (node.nodeType === Node.COMMENT_NODE) {
    return createElementNode({
      name: "#comment",
      type: "comment",
      value: node.textContent ?? "",
    });
  }

  if (node.nodeType === Node.CDATA_SECTION_NODE) {
    return createElementNode({
      name: "#cdata",
      type: "cdata",
      value: node.textContent ?? "",
    });
  }

  const element = node as Element;

  return createElementNode({
    name: element.tagName,
    type: "element",
    attributes: Array.from(element.attributes ?? []).map((attribute) => {
      return {
        id: nanoid(),
        name: attribute.name,
        value: attribute.value,
      };
    }),
    childrens: Array.from(element.childNodes ?? [])
      .filter((child) => {
        return (
          child.nodeType !== Node.TEXT_NODE ||
          (child.textContent ?? "").trim().length > 0
        );
      })
      .map(domNodeToTree),
  });
}

/** Appends an editable tree node to an XML document. */
export function appendTreeToDom(
  document: XMLDocument,
  parent: Node,
  treeNode: XMLTreeNode
): void {
  if (treeNode.type === "text") {
    parent.appendChild(document.createTextNode(treeNode.value ?? ""));
    return;
  }

  if (treeNode.type === "comment") {
    parent.appendChild(document.createComment(treeNode.value ?? ""));
    return;
  }

  if (treeNode.type === "cdata") {
    parent.appendChild(document.createCDATASection(treeNode.value ?? ""));
    return;
  }

  const element = document.createElement(treeNode.name || "node");

  (treeNode.attributes ?? []).forEach((attribute) => {
    if (attribute.name?.trim()) {
      element.setAttribute(attribute.name.trim(), attribute.value ?? "");
    }
  });
  (treeNode.childrens ?? []).forEach((childNode) => {
    return appendTreeToDom(document, element, childNode);
  });
  parent.appendChild(element);
}

/** Serializes the editable XML tree. */
export function serializeXML(root: XMLTreeNode): string {
  const xmlDocument = document.implementation.createDocument("", "", null);

  appendTreeToDom(xmlDocument, xmlDocument, root);

  return new XMLSerializer().serializeToString(xmlDocument);
}

/** Parses XML source into the editable tree model. */
export function parseXMLTree(source: string): {
  result?: XMLTreeNode;
  error?: Error;
} {
  const parsed = parseStringXML(source);

  if (parsed.error || !parsed.result?.documentElement) {
    return {
      error: parsed.error ?? new Error("XML is invalid."),
    };
  }

  return {
    result: domNodeToTree(parsed.result.documentElement),
  };
}

/** Updates a node in place and reports whether it was found. */
export function updateNode(
  current: XMLTreeNode,
  nodeId: string,
  patch: XMLTreeNode
): boolean {
  if (current.id === nodeId) {
    Object.assign(current, patch);
    return true;
  }

  return (current.childrens ?? []).some((child) => {
    return updateNode(child, nodeId, patch);
  });
}

/** Adds a child node in place. */
export function addChildNode(
  current: XMLTreeNode,
  parentId: string,
  child: XMLTreeNode
): boolean {
  if (current.id === parentId) {
    current.childrens = [...(current.childrens ?? []), child];
    return true;
  }

  return (current.childrens ?? []).some((node) => {
    return addChildNode(node, parentId, child);
  });
}

/** Deletes a descendant node in place. */
export function deleteNode(current: XMLTreeNode, nodeId: string): boolean {
  const children = current.childrens ?? [];
  const childIndex = children.findIndex((child) => {
    return child.id === nodeId;
  });

  if (childIndex >= 0) {
    children.splice(childIndex, 1);
    return true;
  }

  return children.some((child) => {
    return deleteNode(child, nodeId);
  });
}

/** Replaces a node while retaining its stable id. */
export function replaceNode(
  current: XMLTreeNode,
  nodeId: string,
  nextNode: XMLTreeNode
): boolean {
  if (current.id === nodeId) {
    Object.assign(current, nextNode, {
      id: nodeId,
    });
    return true;
  }

  return (current.childrens ?? []).some((child) => {
    return replaceNode(child, nodeId, nextNode);
  });
}

/** Returns a patch that appends an empty attribute. */
export function addAttribute(node: XMLTreeNode): XMLTreeNode {
  return {
    attributes: [
      ...(node.attributes ?? []),
      {
        id: nanoid(),
        name: "name",
        value: "",
      },
    ],
  };
}

/** Counts editable XML tree nodes. */
export function countXMLNodes(node: XMLTreeNode): number {
  return (
    1 +
    (node.childrens ?? []).reduce((count, child) => {
      return count + countXMLNodes(child);
    }, 0)
  );
}
