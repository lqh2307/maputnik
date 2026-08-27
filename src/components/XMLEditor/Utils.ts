import { parseStringXML } from "../../utils/Object";
import { XMLTreeNode } from "./Types";
import { nanoid } from "nanoid";

/**
 * Create a normalized XML tree node.
 * @param option Partial node values to preserve; omitted fields receive safe
 *   editor defaults and a generated id.
 * @returns A complete node suitable for the XML editor tree.
 */
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

/**
 * Convert a browser DOM node into the editable tree model.
 * @param node DOM node to convert, including element, text, comment, or CDATA.
 * @returns Serializable editor node with recursively converted children.
 */
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
  const attributes: XMLTreeNode["attributes"] = [];
  for (const attribute of element.attributes ?? []) {
    attributes.push({
      id: nanoid(),
      name: attribute.name,
      value: attribute.value,
    });
  }

  const childrens: XMLTreeNode[] = [];
  for (const child of element.childNodes ?? []) {
    if (
      child.nodeType === Node.TEXT_NODE &&
      (child.textContent ?? "").trim().length === 0
    ) {
      continue;
    }
    childrens.push(domNodeToTree(child));
  }

  return createElementNode({
    name: element.tagName,
    type: "element",
    attributes,
    childrens,
  });
}

/**
 * Append an editable tree node to an XML document.
 * @param document Owner document used to create DOM nodes.
 * @param parent DOM parent receiving the converted node.
 * @param treeNode Editor node to append recursively.
 */
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

/**
 * Serialize the editable XML tree.
 * @param root Root node to serialize.
 * @returns XML string representing `root` and its descendants.
 */
export function serializeXML(root: XMLTreeNode): string {
  const xmlDocument = document.implementation.createDocument("", "", null);

  appendTreeToDom(xmlDocument, xmlDocument, root);

  return new XMLSerializer().serializeToString(xmlDocument);
}

/**
 * Parse XML source into the editable tree model.
 * @param source XML text to parse.
 * @returns Parsed root node, or an error when the XML is invalid.
 */
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

/**
 * Update one node in place and report whether it was found.
 * @param current Tree root to search and mutate.
 * @param nodeId Id of the node to update.
 * @param patch Partial node properties to assign.
 * @returns `true` when a matching node was updated.
 */
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

/**
 * Add a child node beneath a parent id in place.
 * @param current Tree root to search and mutate.
 * @param parentId Id of the parent node.
 * @param child Node to append.
 * @returns `true` when the parent was found.
 */
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

/**
 * Delete a descendant node in place.
 * @param current Tree root to search and mutate.
 * @param nodeId Id of the node to remove.
 * @returns `true` when a matching node was removed.
 */
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

/**
 * Replace a node while retaining its stable id.
 * @param current Tree root to search and mutate.
 * @param nodeId Id of the node to replace.
 * @param nextNode Replacement node values.
 * @returns `true` when a matching node was replaced.
 */
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

/**
 * Create a patch that appends an empty attribute.
 * @param node Node whose attribute list should receive the new item.
 * @returns Partial node containing the appended attribute.
 */
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

/**
 * Count editable XML tree nodes recursively.
 * @param node Root node whose descendants should be counted.
 * @returns Number of nodes including `node` itself.
 */
export function countXMLNodes(node: XMLTreeNode): number {
  return (
    1 +
    (node.childrens ?? []).reduce((count, child) => {
      return count + countXMLNodes(child);
    }, 0)
  );
}
