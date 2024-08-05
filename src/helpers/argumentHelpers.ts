// src/helpers/argumentHelpers.ts

import { useStore } from '../store';
import { makeInputPrompt } from '../utils/promptUtils';
import { fetchGPTResponse } from '../services/openai';
import { parseArgumentResponse } from '../utils/parseArgumentResponse';
import { ParsedArgument, ConversationEntry } from '../types/argumentTypes';
import { Node, Edge } from 'reactflow';
import { customNodeStyle } from '../components/shared/styles/nodeStyles';
import { calculateNodeWidth } from '../utils/nodeUtils';

const NODE_SPACING = 50;
const LAYER_SPACING = 200;

const createNodesAndEdges = (parsedArguments: ParsedArgument[], argumentId: string, rootPosition: { x: number; y: number}, rootNodeWidth: number, rootNodeId: string) => {
  const { getNodeID } = useStore.getState();

  const allNodes: Node[] = [];
  const allEdges: Edge[] = [];

  const createNode = (type: string, text: string, position: { x: number; y: number }, parentId: string | null = null): { id: string; width: number } => {
    const id = getNodeID(type);
    const width = calculateNodeWidth(text);

    const node: Node = {
      id,
      type,
      position,
      data: { text, argumentId },
      style: customNodeStyle
    };
    allNodes.push(node);

    if (parentId) {
      const edge: Edge = {
        id: getNodeID('edge'),
        source: parentId,
        target: id,
        sourceHandle: 'out',
        targetHandle: 'in',
        data: { argumentId },
      };
      allEdges.push(edge);
    }

    return { id, width };
  };

  parsedArguments.forEach((arg) => {
    const conclusionNodeWidth = calculateNodeWidth(arg.conclusion);
    const rootNodeCenterX = rootPosition.x + rootNodeWidth / 2;
    const conclusionNodeX = rootNodeCenterX - conclusionNodeWidth / 2; // Center the conclusion node under the root node

    const conclusionNode = createNode('conclusion', arg.conclusion, { x: conclusionNodeX, y: rootPosition.y + LAYER_SPACING }, rootNodeId);

    // Calculate the total width of all premise nodes combined plus the node spacing
    const premiseWidths = arg.premises.map(premise => calculateNodeWidth(premise));
    const totalPremiseWidth = premiseWidths.reduce((sum, width) => sum + width, 0) + (premiseWidths.length - 1) * NODE_SPACING;

    // Center the gap between premise nodes under the conclusion node
    let currentPremiseX = conclusionNodeX + conclusionNodeWidth / 2 - totalPremiseWidth / 2 + premiseWidths[0] / 2;

    arg.premises.forEach((premise, premiseIndex) => {
      const premiseNode = createNode('premise', premise, { x: currentPremiseX, y: rootPosition.y + 2 * LAYER_SPACING }, conclusionNode.id);

      // Calculate the total width of all assumption nodes for this premise and spacing
      const assumptionWidths = arg.assumptions.filter(assumption => assumption.premiseIndex === premiseIndex).map(assumption => calculateNodeWidth(assumption.text));
      const totalAssumptionWidth = assumptionWidths.reduce((sum, width) => sum + width, 0) + (assumptionWidths.length - 1) * NODE_SPACING;

      // Center the gap between assumption nodes under the premise node
      let currentAssumptionX = currentPremiseX + premiseNode.width / 2 - totalAssumptionWidth / 2 + assumptionWidths[0] / 2;
      arg.assumptions.filter(assumption => assumption.premiseIndex === premiseIndex).forEach((assumption) => {
        const assumptionNode = createNode('assumption', assumption.text, { x: currentAssumptionX, y: rootPosition.y + 3 * LAYER_SPACING }, premiseNode.id);
        currentAssumptionX += assumptionNode.width + NODE_SPACING;
      });

      currentPremiseX += premiseNode.width + NODE_SPACING;
    });
  });

  return { allNodes, allEdges };
};

export const initiateArgument = async (input: string, argumentId: string, rootNodeId: string, rootPosition: { x: number; y: number }) => {
  const {
    addNode,
    addEdge,
    setArgumentConversationHistory,
  } = useStore.getState();

  const conversationHistory = useStore.getState().arguments[argumentId]?.conversationHistory || [];

  try {
    const updatedHistory: ConversationEntry[] = [...conversationHistory, { role: 'user', content: makeInputPrompt(input) }];
    const gptResponse = await fetchGPTResponse(updatedHistory);
    const responseContent = gptResponse.choices[0]?.message?.content || 'No response received.';
    const updatedHistoryWithResponse: ConversationEntry[] = [...updatedHistory, { role: 'system', content: responseContent }];

    const parsedArguments: ParsedArgument[] = parseArgumentResponse(responseContent);

    const rootNodeWidth = calculateNodeWidth(input);

    const { allNodes, allEdges } = createNodesAndEdges(parsedArguments, argumentId, rootPosition, rootNodeWidth, rootNodeId);

    allNodes.forEach(node => addNode(node));
    setTimeout(() => {
      allEdges.forEach(edge => addEdge(edge));
    }, 100);

    setArgumentConversationHistory(argumentId, updatedHistoryWithResponse);

  } catch (error) {
    console.error("Error fetching GPT response:", error);
  }
};