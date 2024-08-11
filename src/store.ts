// src/store.ts

import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import { ConversationEntry } from './types/argumentTypes';

interface NodeIDInfo {
  count: number;
}

interface ArgumentState {
  conversationHistory: ConversationEntry[];
}

interface HandleConnection {
  [key: string]: boolean;
}

export interface State {
  nodes: Node[];
  edges: Edge[];
  handleConnections: HandleConnection;
  nodeIDs: { [type: string]: NodeIDInfo };
  arguments: { [type: string]: ArgumentState };
  getNodeID: (type: string) => string;
  addNode: (node: Node) => void;
  addEdge: (edge: Edge) => void;
  removeEdge: (edgeId: string) => void;
  updateNodeField: (nodeId: string, fieldName: string, fieldValue: any) => void;
  addNodeStyle: (nodeId: string, styleField: any, styleValue: any) => void;
  setNodePosition: (nodeId: string, position: { x: number, y: number }) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  setArgumentConversationHistory: (argumentId: string, history: ConversationEntry[]) => void;
  getNodesByArgumentId: (argumentId: string) => Node[];
  getEdgesByArgumentId: (argumentId: string) => Edge[]; 
}

export const useStore = createWithEqualityFn<State>(
  (set, get) => ({
    nodes: [],
    edges: [],
    handleConnections: {},
    nodeIDs: {},
    arguments: {},
    getNodeID: (type: string) => {
      const newIDs = {...get().nodeIDs};
      if (!newIDs[type]) {
        newIDs[type] = { count: 0 };
      }
      newIDs[type].count += 1;
      set({ nodeIDs: newIDs });
      return `${type}-${newIDs[type].count}`;
    },
    addNode: (node: Node) => {
      set({
        nodes: [...get().nodes, node],
      });
    },
    addEdge: (edge: Edge) => {
      set(state => {
        const newEdges = [...state.edges, edge];
        const newConnections = { ...state.handleConnections };

        // Update handle connections
        if (edge.sourceHandle) {
          newConnections[edge.sourceHandle] = true;
        }
        if (edge.targetHandle) {
          newConnections[edge.targetHandle] = true;
        }

        return {
          edges: newEdges,
          handleConnections: newConnections,
        };
      });
    },
    removeEdge: (edgeId: string) => {
      set(state => {
        const edge = state.edges.find(e => e.id === edgeId);
        if (!edge) return state;

        const newEdges = state.edges.filter(e => e.id !== edgeId);
        const newConnections = { ...state.handleConnections };

        // Update handle connections
        if (edge.sourceHandle) {
          newConnections[edge.sourceHandle] = newEdges.some(e => e.sourceHandle === edge.sourceHandle || e.targetHandle === edge.sourceHandle);
        }
        if (edge.targetHandle) {
          newConnections[edge.targetHandle] = newEdges.some(e => e.sourceHandle === edge.targetHandle || e.targetHandle === edge.targetHandle);
        }

        return {
          edges: newEdges,
          handleConnections: newConnections,
        };
      });
    },
    updateNodeField: (nodeId: string, fieldName: string, fieldValue: any) => {
      set({
        nodes: get().nodes.map((node) => {
          if (node.id === nodeId) {
            node.data = { ...node.data, [fieldName]: fieldValue };
          }
          return node;
        })
      })
    },
    addNodeStyle: (nodeId: string, styleField: any, styleValue: any) => {
      set({
        nodes: get().nodes.map((node) => {
          if (node.id === nodeId) {
            node.style = { ...node.style, [styleField]: styleValue };
          }
          return node;
        })
      })
    },
    setNodePosition: (nodeId: string, position: { x: number, y: number }) => {
      set({
        nodes: get().nodes.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              position: position, // Update position directly on the node object
            };
          }
          return node;
        }),
      });
    },
    onNodesChange: (changes: NodeChange[]) => {
      set({
        nodes: applyNodeChanges(changes, get().nodes),
      });
    },
    onEdgesChange: (changes: EdgeChange[]) => {
      set({
        edges: applyEdgeChanges(changes, get().edges),
      });
    },
    onConnect: (connection: Connection) => {
      set(state => {
        const newEdges = addEdge({ ...connection }, state.edges);
        const newConnections = { ...state.handleConnections };

        // Update handle connections
        if (connection.sourceHandle) {
          newConnections[connection.sourceHandle] = true;
        }
        if (connection.targetHandle) {
          newConnections[connection.targetHandle] = true;
        }

        return {
          edges: newEdges,
          handleConnections: newConnections,
        };
      });
    },
    setArgumentConversationHistory: (argumentId: string, history: ConversationEntry[]) => {
      set(state => ({
        arguments: {
          ...state.arguments,
          [argumentId]: {
            ...state.arguments[argumentId],
            conversationHistory: history,
          },
        },
      }));
    },
    getNodesByArgumentId: (argumentId: string) => {
      return get().nodes.filter(node => node.data.argumentId === argumentId);
    },
    getEdgesByArgumentId: (argumentId: string) => {
      return get().edges.filter(edge => edge.data.argumentId === argumentId);
    },
  }), 
  shallow
);