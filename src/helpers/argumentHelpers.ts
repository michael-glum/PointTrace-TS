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
  const { getNodeID, addNode, addEdge } = useStore.getState();

  const allNodes: Node[] = [];
  const allEdges: Edge[] = [];

  const createNode = (type: string, text: string, position: { x: number; y: number }, parentId: string | null = null): { id: string } => {
    const id = getNodeID(type);

    const node: Node = {
      id,
      type,
      position,
      data: { text, argumentId, defaultEditing: false },
      style: customNodeStyle,
    };
    allNodes.push(node);

    if (parentId) {
      const edge: Edge = {
        id: getNodeID('edge'),
        source: parentId,
        target: id,
        sourceHandle: `${parentId}-out`,
        targetHandle: `${id}-in`,
        data: { argumentId },
      };
      allEdges.push(edge);
    }

    return { id };
  };

  parsedArguments.forEach((arg) => {
    // Create a conclusion node centered under the root node
    const conclusionNode = createNode('conclusion', arg.conclusion, { x: rootPosition.x, y: rootPosition.y + LAYER_SPACING }, rootNodeId);

    // Memoize the widths of all assumption nodes
    const memoizedAssumptionWidths: { [key: string]: number } = arg.assumptions.reduce((acc: { [key: string]: number }, assumption) => {
      acc[assumption.text] = calculateNodeWidth(assumption.text);
      return acc;
    }, {});

    // Find the total width of all groups of assumption nodes
    const groupedAssumptionWidths = arg.premises.map((_, premiseIndex) => {
      const assumptionWidths = arg.assumptions.filter(assumption => assumption.premiseIndex === premiseIndex).map(assumption => memoizedAssumptionWidths[assumption.text]);
      return assumptionWidths.reduce((sum, width) => sum + width, 0) + (assumptionWidths.length - 1) * NODE_SPACING;
    });
    const totalAssumptionWidth = groupedAssumptionWidths.reduce((sum, width) => sum + width, 0) + (groupedAssumptionWidths.length - 1) * NODE_SPACING;

    // Calculate the center position for the entire assumption layer
    const assumptionLayerCenterX = rootPosition.x;

    // Initialize the starting x position for the first group of assumption nodes
    let currentGroupAssumptionX = assumptionLayerCenterX - totalAssumptionWidth / 2;

    const premisePositions: { x: number, y: number, assumptionPositions: { x: number, y: number, text: string }[], premise: string }[] = [];

    arg.premises.forEach((premise, premiseIndex) => {
      // Get the total width of the current group of assumption nodes
      const totalPremiseAssumptionWidth = groupedAssumptionWidths[premiseIndex];

      // Initialize the starting x position for the assumption nodes under the current premise
      let currentAssumptionX = currentGroupAssumptionX;

      // Store positions of the assumption nodes
      const assumptionPositions = arg.assumptions.filter(assumption => assumption.premiseIndex === premiseIndex).map((assumption) => {
        const assumptionWidth = memoizedAssumptionWidths[assumption.text];
        const assumptionPosition = { x: currentAssumptionX + assumptionWidth / 2, y: rootPosition.y + 3 * LAYER_SPACING, text: assumption.text };
        currentAssumptionX += assumptionWidth + NODE_SPACING;
        return assumptionPosition;
      });

      // Calculate the x position of the current premise node to center it above its child assumption nodes
      const premiseNodeX = currentGroupAssumptionX + totalPremiseAssumptionWidth / 2;

      // Store the position of the premise node
      premisePositions.push({ x: premiseNodeX, y: rootPosition.y + 2 * LAYER_SPACING, assumptionPositions, premise });

      // Move to the next group of assumption nodes
      currentGroupAssumptionX += totalPremiseAssumptionWidth + NODE_SPACING;
    });

    // Create nodes and edges
    premisePositions.forEach(({ x, y, assumptionPositions, premise }) => {
      const premiseNode = createNode('premise', premise, { x, y }, conclusionNode.id);

      assumptionPositions.forEach(({ x: assumptionX, y: assumptionY, text }) => {
        createNode('assumption', text, { x: assumptionX, y: assumptionY }, premiseNode.id);
      });
    });
  });

  allNodes.forEach(node => addNode(node));
  allEdges.forEach(edge => addEdge(edge));

  // Return values may be used for validation
  return { allNodes, allEdges };
};

export const initiateArgument = async (input: string, argumentId: string, rootNodeId: string, rootPosition: { x: number; y: number }) => {
  const {
    setArgumentConversationHistory,
  } = useStore.getState();

  const conversationHistory = useStore.getState().arguments[argumentId]?.conversationHistory || [];

  try {
    const updatedHistory: ConversationEntry[] = [...conversationHistory, { role: 'user', content: makeInputPrompt(input) }];
    const gptResponse = await fetchGPTResponse(updatedHistory);
    const responseContent = gptResponse.choices[0]?.message?.content || 'No response received.';
    //console.log("responseContent:", responseContent);

    const updatedHistoryWithResponse: ConversationEntry[] = [...updatedHistory, { role: 'system', content: responseContent }];

    const parsedArguments: ParsedArgument[] = parseArgumentResponse(responseContent);
    //console.log("parsedArguments: " + JSON.stringify(parsedArguments));

    const rootNodeWidth = calculateNodeWidth(input);
    console.log(`${rootPosition.x} is x-position of ${rootNodeId}`);
    console.log(`${rootNodeWidth} is width of ${rootNodeId}`);

    createNodesAndEdges(parsedArguments, argumentId, rootPosition, rootNodeWidth, rootNodeId);

    setArgumentConversationHistory(argumentId, updatedHistoryWithResponse);

  } catch (error) {
    console.error("Error fetching GPT response:", error);
  }
};