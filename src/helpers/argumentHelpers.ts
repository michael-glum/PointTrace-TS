// src/helpers/argumentHelpers.ts

import { useStore } from '../store';
import { makeInputPrompt } from '../utils/promptUtils';
import { fetchGPTResponse } from '../services/openai';
import { parseArgumentResponse } from '../utils/parseArgumentResponse';
import { ParsedArgument, ConversationEntry, TreeNode } from '../types/argumentTypes';
import { Node, Edge } from 'reactflow';
import { calculateSubtreeWidth, LAYER_SPACING, positionNodesInSubtree, transformArgumentToTreeNodes } from '../utils/argumentUtils';
import { customNodeStyle } from '../components/shared/styles/nodeStyles';

export const initiateArgument = async (input: string, argumentId: string, rootNodeId: string, rootPosition: { x: number; y: number }) => {
  const {
    getNodeID,
    addNode,
    addEdge,
    setArgumentConversationHistory,
    getNodesByArgumentId,
    getEdgesByArgumentId
  } = useStore.getState();

  const conversationHistory = useStore.getState().arguments[argumentId]?.conversationHistory || [];

  try {
    const updatedHistory: ConversationEntry[] = [...conversationHistory, { role: 'user', content: makeInputPrompt(input) }];
    const gptResponse = await fetchGPTResponse(updatedHistory);
    const responseContent = gptResponse.choices[0]?.message?.content || 'No response received.';
    const updatedHistoryWithResponse: ConversationEntry[] = [...updatedHistory, { role: 'system', content: responseContent }];

    const parsedArguments: ParsedArgument[] = parseArgumentResponse(responseContent);
    const argumentTree = transformArgumentToTreeNodes(parsedArguments, argumentId);

    const totalWidth = calculateSubtreeWidth(argumentTree);
    const startX = rootPosition.x - totalWidth / 2;
    const startY = rootPosition.y + LAYER_SPACING;
    positionNodesInSubtree(argumentTree, startX, startY);

    const allNodes: Node[] = [];
    const allEdges: Edge[] = [];

    const flattenTree = (node: TreeNode, parentId: string) => {
      const id = getNodeID(node.type!);
      allNodes.push({
        id,
        type: node.type,
        position: node.position,
        data: {
          ...node.data,
          text: node.data.text,
        },
        style: customNodeStyle
      });

      if (parentId) {
        const edge = {
          id: getNodeID('edge'),
          source: parentId,
          target: id,
          sourceHandle: 'out',
          targetHandle: 'in',
          data: { argumentId }
        };
        allEdges.push(edge);
      }

      node.children.forEach(child => flattenTree(child, id));
    };

    argumentTree.forEach(node => flattenTree(node, rootNodeId));

    allNodes.forEach(node => addNode(node));
    setTimeout(() => {
      allEdges.forEach(edge => addEdge(edge));
    }, 100);

    setArgumentConversationHistory(argumentId, updatedHistoryWithResponse);

  } catch (error) {
    console.error("Error fetching GPT response:", error);
  }
};