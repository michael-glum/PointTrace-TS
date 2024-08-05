// src/components/workspace/FlowCanvas.tsx

import React, { useState, useRef, useCallback } from 'react';
import ReactFlow, {
  ReactFlowInstance,
  Controls,
  Background,
  MiniMap,
  MarkerType,
  ConnectionLineType,
  Edge
} from 'reactflow';
import { State, useStore } from '../../store';
import theme from '../../theme';
import { customNodeStyle } from '../shared/styles/nodeStyles';
import InputNode from '../nodes/InputNode';

import 'reactflow/dist/style.css';
import ConclusionNode from '../nodes/ConclusionNode';
import PremiseNode from '../nodes/PremiseNode';
import AssumptionNode from '../nodes/AssumptionNode';
import { nodeStartingDimensions } from '../../utils/nodeUtils';

const gridSize = 20;
const nodeTypes = {
  input: InputNode,
  conclusion: ConclusionNode,
  premise: PremiseNode,
  assumption: AssumptionNode,
};

const selector = (state: State) => ({
  nodes: state.nodes,
  edges: state.edges,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

export const FlowCanvas: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const {
    nodes,
    edges,
    getNodeID,
    addNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useStore(selector);

  const getInitNodeData = (nodeID: string, type: string) => {
    const nodeData = { id: nodeID, nodeType: `${type}` };
    return nodeData;
  }

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current!.getBoundingClientRect();
      const data = event.dataTransfer.getData('application/reactflow')
      if (data) {
        const appData = JSON.parse(data);
        const type = appData?.nodeType;
  
        if (typeof type === 'undefined' || !type) {
          return;
        }

        // Get default node dimensions
        const dimensions = nodeStartingDimensions // nodeDimensions[type] || nodeDimensions.default;
  
        // Calculate position adjusted for node dimensions to center it
        const position = reactFlowInstance!.project({
          x: event.clientX - reactFlowBounds.left - dimensions.width / 2,
          y: event.clientY - reactFlowBounds.top - dimensions.height / 2,
        });

        const nodeID = getNodeID(type);
        const newNode = {
          id: nodeID,
          type,
          position,
          data: getInitNodeData(nodeID, type),
          style: customNodeStyle
        };

        addNode(newNode);
      }
    },
    [reactFlowInstance, getNodeID, addNode]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const defaultEdgeOptions: Partial<Edge> = {
    style: { stroke: theme.colors.primary },
    type: ConnectionLineType.SmoothStep,
    animated: true,
    markerEnd: { type: MarkerType.Arrow, height: 20, width: 20, color: theme.colors.primary },
  };

  return (
    <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        defaultEdgeOptions={defaultEdgeOptions}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        snapGrid={[gridSize, gridSize]}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{ stroke: theme.colors.border }}
      >
        <Background color="#aaa" gap={gridSize} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}