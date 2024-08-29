// src/utils/autoLayout.ts

import { Node } from 'reactflow';

const DEFAULT_NODE_SPACING = 50;
const DEFAULT_LAYER_SPACING = 200;

export const createAutoLayout = (nodes: Node[], nodeChildren: Map<string, string[]>, rootNodeId: string): Node[] => {
  const nodeMap: Map<string, Node> = nodes.reduce((map, node) => {
    map.set(node.id, node);
    return map;
  }, new Map<string, Node>());

  nodeChildren.get(rootNodeId)?.forEach((childId) => {
    positionNodeBasedOnChildren(nodeMap, nodeChildren, childId);
  })

  return Array.from(nodeMap.values());
}

const positionNodeBasedOnChildren = (nodeMap: Map<string, Node>, nodeChildren: Map<string, string[]>, nodeId: string) => {
  nodeChildren.get(nodeId)?.forEach((childId) => {
    positionNodeBasedOnChildren(nodeMap, nodeChildren, childId);
    setRightSpacing(nodeMap, nodeChildren, childId);
  })

  setTotalWidthOfChildren(nodeMap, nodeChildren, nodeId);

  const node = nodeMap.get(nodeId)!;

  const width = node.width!;
  let widthAcc = 0;
  let totalWidthLeft = (node.data.totalWidthOfChildren > width) ? (node.data.totalWidthOfChildren - width) / 2 : 0;
  let totalWidthRight = (node.data.totalWidthOfChildren > width) ? (node.data.totalWidthOfChildren + width) / 2: width;
  let widthMeasure = totalWidthLeft;
  let leftTranslate = totalWidthLeft;

  while (widthAcc < widthMeasure) {
    if (widthAcc > totalWidthLeft) {
      widthAcc -= totalWidthLeft;
      widthMeasure = totalWidthRight;
      totalWidthLeft = Infinity;
      leftTranslate = 0;
    }
    node.position.x = widthAcc - leftTranslate;
    widthAcc += width + node.data.rightSpacing;
  }

  node.position.y = DEFAULT_LAYER_SPACING;
}

const setTotalWidthOfChildren = (nodeMap: Map<string, Node>, nodeChildren: Map<string, string[]>, nodeId: string) => {
  let totalWidthOfChildren = 0;
  nodeChildren.get(nodeId)?.forEach((childId) => {
    const childNode = nodeMap.get(childId);
    totalWidthOfChildren += childNode?.width + childNode?.data.rightSpacing;
  })
  nodeMap.get(nodeId)!.data.totalWidthOfChildren = totalWidthOfChildren;
  console.log(nodeId, "TWC:", totalWidthOfChildren);
}

const setRightSpacing = (nodeMap: Map<string, Node>, nodeChildren: Map<string, string[]>, nodeId: string) => {
  console.log(nodeId, "setRightSpacing");
  const nodes = nodeChildren.get(nodeId) || [];

  let i;
  for (i = 0; i < nodes.length; i++) {
    const node = nodeMap.get(nodes[i])!;
    console.log(nodeId, "TWC:", node.data.totalWidthOfChildren, "Width:", node.width!);
    if (node.data.totalWidthOfChildren < node.width!) {
      node.data.rightSpacing = node.width! + DEFAULT_NODE_SPACING;
      console.log("Spacing");
    } else {
      let spacing = 0;
      if (i + 1 < nodes.length) {
        const node1 = nodeMap.get(nodes[i + 1])!;
        spacing = (node.data.totalWidthOfChildren - node.width!) / 2 
                          + (node1.data.totalWidthOfChildren - node1.data.width!) / 2
                          + DEFAULT_NODE_SPACING;
        node.data.rightSpacing = spacing;
      } else {
        nodeMap.get(nodes[i])!.data.rightSpacing = 0;
      }
      console.log("Spacing:", spacing);
    }
  }
}