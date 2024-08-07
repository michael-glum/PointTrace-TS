// src/utils/flowUtils.ts

import { Node, Edge } from 'reactflow';

export const getSubtreeNodes = (rootNodeId: string, edges: Edge[], nodes: Node[]): Node[] => {
  const visited = new Set<string>();
  const subtreeNodes = new Set<Node>();

  const dfs = (nodeId: string) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const node = nodes.find(n => n.id === nodeId);
    if (node) subtreeNodes.add(node);

    edges.forEach(edge => {
      if (edge.source === nodeId) {
        dfs(edge.target);
      }
    });
  };

  dfs(rootNodeId);

  return Array.from(subtreeNodes);
};
