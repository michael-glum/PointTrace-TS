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

export interface State {
  nodes: Node[];
  edges: Edge[];
  nodeIDs: { [type: string]: NodeIDInfo };
  arguments: { [type: string]: ArgumentState };
  getNodeID: (type: string) => string;
  addNode: (node: Node) => void;
  addEdge: (edge: Edge) => void;
  updateNodeField: (nodeId: string, fieldName: string, fieldValue: any) => void;
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
      set(state => ({
        edges: [...state.edges, edge],
      }));
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
      set({
        edges: addEdge({ ...connection }, get().edges),
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