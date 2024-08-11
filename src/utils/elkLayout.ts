// src/utils/elkLayout.ts

import ELK, { ElkNode, ElkExtendedEdge } from 'elkjs/lib/elk.bundled.js';
import { Node, Edge } from 'reactflow';
import { nodeStartingDimensions } from './nodeUtils';

const elk = new ELK();

interface LayoutProps {
  nodes: Node[];
  edges: Edge[];
}

export const performElkLayout = async ({ nodes, edges}: LayoutProps, rootNodeId: string, argumentId: string): Promise<Node[]> => {
  // Find the root node and store its initial position
  const rootNode = nodes.find((node) => node.id === rootNodeId);
  const initialRootPosition = rootNode ? rootNode.position : { x: 0, y: 0 };

  const elkNodes: ElkNode[] = nodes.map((node) => ({
    id: node.id,
    width: node.width ?? nodeStartingDimensions.width,  // Fallback to starting dimensions
    height: node.height ?? nodeStartingDimensions.height,
  }));

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
      'elk.direction': 'DOWN',           
      'elk.layered.spacing.nodeNode': '50', 
      'elk.layered.spacing.nodeNodeBetweenLayers': '75',
      'elk.layered.considerModelOrder': 'true',
      'elk.layered.nodePlacement.strategy': 'SIMPLE',
    },
    children: elkNodes,
    edges: elkEdges,
  });

  if (layout.children) {
    // Get the position of the root node after layout
    const layoutRootNode = layout.children.find((child) => child.id === rootNodeId);
    const layoutRootPosition = layoutRootNode ? { x: layoutRootNode.x!, y: layoutRootNode.y! } : { x: 0, y: 0}

    // Calculate the offset required to keep the root node at its initial position
    const offsetX = initialRootPosition.x - layoutRootPosition.x;
    const offsetY = initialRootPosition.y - layoutRootPosition.y;

    return layout.children.map((child) => ({
      id: child.id,
      position: {
        x: child.x! + offsetX,
        y: child.y! + offsetY,
      },
      data: nodes.find((n) => n.id === child.id)?.data,
    })) as Node[];
  }

  return []; // Return an empty array if no layout was done
};
