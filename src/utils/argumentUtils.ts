// src/utils/argumentUtils.ts

import { ParsedArgument, TreeNode } from "../types/argumentTypes";
import { nodeStartingDimensions } from "./nodeUtils";

const NODE_SPACING = 50;
export const LAYER_SPACING = 200;

export const calculateSubtreeWidth = (subtree: TreeNode[]): number => {
  if (!subtree || subtree.length === 0) return 0;
  const childWidths = subtree.map(node => calculateSubtreeWidth(node.children));
  const maxChildWidth = Math.max(...childWidths, 0);
  return Math.max(subtree.length * nodeStartingDimensions.width + (subtree.length - 1) * NODE_SPACING, maxChildWidth);
};

export const positionNodesInSubtree = (subtree: TreeNode[], startX: number, y: number): void => {
  const subtreeWidth = calculateSubtreeWidth(subtree);
  let currentX = startX + (subtreeWidth - (subtree.length * nodeStartingDimensions.width + (subtree.length - 1) * NODE_SPACING)) / 2;

  subtree.forEach(node => {
    node.position = { x: currentX, y };
    if (node.children && node.children.length > 0) {
      positionNodesInSubtree(node.children, currentX - (calculateSubtreeWidth(node.children) - nodeStartingDimensions.width) / 2, y + LAYER_SPACING);
    }
    currentX += nodeStartingDimensions.width + NODE_SPACING;
  });
};

export const transformArgumentToTreeNodes = (parsedArguments: ParsedArgument[], argumentId: string): TreeNode[] => {
  return parsedArguments.map(arg => ({
    type: 'conclusion',
    data: { text: arg.conclusion, argumentId },
    position: { x: 0, y: 0 }, // Positions will be set later
    children: arg.premises.map((premise, premiseIndex) => ({
      type: 'premise',
      data: { text: premise, argumentId },
      position: { x: 0, y: 0 },
      children: arg.assumptions
        .filter(assumption => assumption.premiseIndex === premiseIndex)
        .map(assumption => ({
          type: 'assumption',
          data: { text: assumption.text, argumentId },
          position: { x: 0, y: 0 },
          children: []
        }))
    }))
  }));
};