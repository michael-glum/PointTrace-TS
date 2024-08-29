// src/utils/elkLayout.ts

import ELK, { ElkNode, ElkExtendedEdge } from 'elkjs/lib/elk.bundled.js';
import { Node, Edge } from 'reactflow';
import { nodeStartingDimensions } from './nodeUtils';

const elk = new ELK();

interface LayoutProps {
  nodes: Node[];
  edges: Edge[];
}

/*const buildTreeStructure = (nodes: Node[], rootNodeId: string): ElkNode => {
  const nodeMap: Record<string, ElkNode> = {};

  // Initialize each ELK node based on the React Flow node data
  nodes.forEach((node) => {
    nodeMap[node.id] = {
      id: node.id,
      width: node.width ?? nodeStartingDimensions.width, // Fallback if width is null or undefined
      height: node.height ?? nodeStartingDimensions.height, // Fallback if height is null or undefined
      children: [], // Prepare to hold child nodes
      layoutOptions: {
        'elk.direction': 'CENTER',
      },
    };

    console.log(node.width);
    console.log(node.height);
  });

  // Build the tree structure based on parentId
  nodes.forEach((node) => {
    if (node.parentId) {
      // Add this node as a child to its parent
      nodeMap[node.parentId].children!.push(nodeMap[node.id]);
    }
  });

  console.log("Tree structure:", JSON.stringify(nodeMap[rootNodeId], null, 2));
  return nodeMap[rootNodeId]; // Return the tree structure rooted at rootNodeId
};

export const performElkLayout = async ({ nodes, edges}: LayoutProps, rootNodeId: string, argumentId: string): Promise<Node[]> => {
  const buildTreeStructure = (nodes: Node[], rootNodeId: string): ElkNode => {
    const nodeMap: Record<string, ElkNode> = {};

    // Initialize each ELK node based on the React Flow node data
    nodes.forEach((node) => {
      nodeMap[node.id] = {
        id: node.id,
        width: node.width ?? nodeStartingDimensions.width,
        height: node.height ?? nodeStartingDimensions.height,
        children: [], // Prepare to hold child nodes
        layoutOptions: {
          'elk.direction':'RIGHT',
        },
      };
    });

    // Build the tree structure based on parentId
    nodes.forEach((node) => {
      if (node.parentId) {
        nodeMap[node.parentId].children!.push(nodeMap[node.id]);
      }
    });

    return nodeMap[rootNodeId]; // Return the tree structure rooted at rootNodeId
  };

  const elkRootNode = buildTreeStructure(nodes, rootNodeId);

  const elkEdges: ElkExtendedEdge[] = edges.map((edge) => ({
    id: edge.id,
    sources: [edge.source],
    targets: [edge.target],
  }));

  const layout = await elk.layout({
    id: `${argumentId}-layout`,
    layoutOptions: {
      'elk.algorithm': 'org.eclipse.elk.layered',
      'elk.alignment': 'CENTER',
      'elk.direction': 'DOWN', // Global direction
      'elk.layered.spacing.nodeNode': '50',
      'elk.layered.spacing.nodeNodeBetweenLayers': '75',
      'elk.layered.considerModelOrder': 'true',
      'elk.layered.nodePlacement.strategy': 'SIMPLE',
    },
    children: [elkRootNode],
  });

  console.log("Layout result:", JSON.stringify(layout, null, 2));

  const flattenLayout = (elkNode: ElkNode, parentOffsetX = 0, parentOffsetY = 0): Node[] => {
    const flattenedNodes: Node[] = [];

    const traverse = (node: ElkNode, offsetX: number, offsetY: number, parentNode?: string) => {
      const nodeData = nodes.find((n) => n.id === node.id);

      if (node.x !== undefined && node.y !== undefined) {
        flattenedNodes.push({
          id: node.id,
          position: {
            x: node.x + offsetX,
            y: node.y + offsetY,
          },
          data: nodeData?.data,
          style: { width: node.width, height: node.height },
          ...(parentNode && { parentNode }),
        });
      }

      if (node.children) {
        node.children.forEach((child) => traverse(child, offsetX + node.x!, offsetY + node.y!, node.id));
      }
    };

    traverse(elkNode, parentOffsetX, parentOffsetY);
    return flattenedNodes;
  };

  if (layout.children) {
    const flattenedNodes = flattenLayout(layout.children[0]);

    return flattenedNodes;
  }

  return [];
};*/

export const performElkLayout = async ({ nodes, edges }: LayoutProps, rootNodeId: string, argumentId: string): Promise<Node[]> => {
  const nodeMap: Record<string, ElkNode> = {};

  // Initialize each ELK node based on the React Flow node data
  nodes.forEach((node) => {
    nodeMap[node.id] = {
      id: node.id,
      width: node.width ?? 100, // Use accurate node dimensions if available
      height: node.height ?? 50,
      children: [],
      layoutOptions: {},
    };
  });

  // Organize nodes into their hierarchical structure
  nodes.forEach((node) => {
    if (node.parentId && nodeMap[node.parentId]) {
      nodeMap[node.parentId].children!.push(nodeMap[node.id]);
    }
  });

  // Ensure the root node and its immediate children are included
  const graph = {
    id: `${argumentId}-layout`,
    layoutOptions: {
      'elk.algorithm': 'org.eclipse.elk.layered',
      'elk.direction': 'DOWN', // Global direction is downwards
      'elk.alignment': 'CENTER',
      'elk.layered.spacing.nodeNode': '50',
      'elk.layered.spacing.nodeNodeBetweenLayers': '75',
      'elk.layered.considerModelOrder': 'false',
      'elk.layered.nodePlacement.strategy': 'SIMPLE',
    },
    children: [nodeMap[rootNodeId]], // Only include the root node with its nested children
  };

  console.log("Graph structure:", JSON.stringify(graph, null, 2));
  const layout = await elk.layout(graph);

  // Flatten the resulting layout into a React Flow-compatible structure
  const flattenLayout = (elkNode: ElkNode, parentNode?: string): Node[] => {
    const flattenedNodes: Node[] = [];

    const traverse = (node: ElkNode, parentNodeId?: string) => {
      const nodeData = nodes.find((n) => n.id === node.id);

      if (node.x !== undefined && node.y !== undefined) {
        flattenedNodes.push({
          id: node.id,
          position: {
            x: node.x,
            y: node.y,
          },
          data: nodeData?.data,
          style: { width: node.width, height: node.height },
          ...(parentNodeId && { parentId: parentNodeId }), // Add parentNode relationship if applicable
        });
      }

      if (node.children) {
        node.children.forEach((child) => traverse(child, node.id)); // Traverse through children recursively
      }
    };

    traverse(elkNode);
    return flattenedNodes;
  };

  const flattenedNodes = layout.children ? flattenLayout(layout.children[0]) : [];

  return flattenedNodes;
};