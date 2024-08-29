// src/components/workspace/FlowCanvas.tsx

import React, { useState, useRef, useCallback, useMemo } from 'react';
import ReactFlow, {
  ReactFlowInstance,
  Controls,
  Background,
  MiniMap,
  MarkerType,
  ConnectionLineType,
  Edge,
  OnEdgesDelete,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { State, useStore } from '../../store/store';
import theme from '../../theme';
import { customNodeStyle } from '../shared/styles/nodeStyles';
import InputNode from '../nodes/InputNode';
import ConclusionNode from '../nodes/ConclusionNode';
import PremiseNode from '../nodes/PremiseNode';
import AssumptionNode from '../nodes/AssumptionNode';
import { nodeStartingDimensions } from '../../utils/nodeUtils';

const gridSize = 20;

const selector = (state: State) => ({
  nodes: state.nodes,
  edges: state.edges,
  getNodeID: state.getNodeID,
  getNodeNumber: state.getNodeNumber,
  addNode: state.addNode,
  removeEdge: state.removeEdge,
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
    getNodeNumber,
    addNode,
    removeEdge,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useStore(selector);

  const nodeTypes = useMemo(() => ({
    input: InputNode,
    conclusion: ConclusionNode,
    premise: PremiseNode,
    assumption: AssumptionNode,
  }), []);

  const getInitNodeData = useCallback((nodeID: string, type: string, nodeNumber: string) => {
    const nodeData = { id: nodeID, nodeType: type, nodeNumber: nodeNumber };
    return nodeData;
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const data = event.dataTransfer.getData('application/reactflow');
      if (data) {
        const appData = JSON.parse(data);
        const type = appData?.nodeType;

        if (typeof type === 'undefined' || !type) {
          return;
        }

        const dimensions = nodeStartingDimensions;

        const position = reactFlowInstance!.screenToFlowPosition({
          x: event.clientX - dimensions.width / 2,
          y: event.clientY - dimensions.height / 2,
        });

        const nodeID = getNodeID(type);
        const nodeNumber = getNodeNumber(type);
        const newNode = {
          id: nodeID,
          type,
          position,
          data: getInitNodeData(nodeID, type, nodeNumber),
          style: customNodeStyle
        };

        addNode(newNode);
      }
    },
    [reactFlowInstance, getNodeID, getNodeNumber, addNode, getInitNodeData]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onEdgesDelete: OnEdgesDelete = useCallback((edgesToRemove: Edge[]) => {
    edgesToRemove.forEach((edge) => {
      removeEdge(edge.id);
    });
  }, [removeEdge]);

  const edgeStrokeColor = theme.colors.primary;

  const defaultEdgeOptions: Partial<Edge> = useMemo(() => ({
    style: { stroke: edgeStrokeColor },
    type: ConnectionLineType.SmoothStep,
    animated: true,
    markerEnd: { type: MarkerType.Arrow, height: 20, width: 20, color: edgeStrokeColor },
  }), [edgeStrokeColor]);

  return (
    <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        defaultEdgeOptions={defaultEdgeOptions}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgesDelete={onEdgesDelete}
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
  );
}