// src/helpers/argumentHelpers.ts

import { useStore } from '../store';
import { makeInputPrompt } from '../utils/promptUtils';
import { fetchGPTResponse } from '../services/openai';
import { parseArgumentResponse } from '../utils/parseArgumentResponse';
import { ParsedArgument, ConversationEntry } from '../types/argumentTypes';
import { Node, Edge } from 'reactflow';
import { customNodeStyle } from '../components/shared/styles/nodeStyles';
import { performElkLayout } from '../utils/elkLayout';
import { nodeStartingDimensions } from '../utils/nodeUtils';

const createNodesAndEdges = async (
  parsedArguments: ParsedArgument[],
  argumentId: string,
  rootNodeId: string,
) => {
  const { getNodeID, getNodeNumber, addNode, addEdge } = useStore.getState();

  const allNodes: Node[] = [];
  const allEdges: Edge[] = [];

  const rootNode = useStore.getState().nodes.find((node: Node) => node.id === rootNodeId);
  allNodes.push(rootNode!);

  parsedArguments.forEach((arg) => {
    const conclusionNode = {
      id: getNodeID('conclusion'),
      type: 'conclusion',
      position: { x: 0, y: 0 }, // Position will be set by Elkjs
      data: {
        text: arg.conclusion,
        argumentId,
        defaultEditing: false,
        size: {
          width: nodeStartingDimensions.width,
          height: nodeStartingDimensions.height
        }, // Initialize size with default values
        nodeNumber: getNodeNumber('conclusion'),
      },
      style: { ...customNodeStyle, visibility: 'hidden' as 'hidden' },
    };
    allNodes.push(conclusionNode);

    allEdges.push({
      id: getNodeID('edge'),
      source: rootNodeId,
      target: conclusionNode.id,
      sourceHandle: `${rootNodeId}-out`,
      targetHandle: `${conclusionNode.id}-in`,
      data: { argumentId },
    });

    arg.premises.forEach((premise, premiseIndex) => {
      const premiseNode = {
        id: getNodeID('premise'),
        type: 'premise',
        position: { x: 0, y: 0 },  // Position will be set by Elkjs
        data: {
          text: premise,
          argumentId,
          defaultEditing: false,
          size: {
            width: nodeStartingDimensions.width,
            height: nodeStartingDimensions.height
          }, // Initialize size with default values
          nodeNumber: getNodeNumber('premise'),
        },
        style: { ...customNodeStyle, visibility: 'hidden' as 'hidden' },
      };
      allNodes.push(premiseNode);

      allEdges.push({
        id: getNodeID('edge'),
        source: conclusionNode.id,
        target: premiseNode.id,
        sourceHandle: `${conclusionNode.id}-out`,
        targetHandle: `${premiseNode.id}-in`,
        data: { argumentId },
      });

      arg.assumptions
        .filter(assumption => assumption.premiseIndex === premiseIndex)
        .forEach(assumption => {
          const assumptionNode = {
            id: getNodeID('assumption'),
            type: 'assumption',
            position: { x: 0, y: 0 },  // Position will be set by Elkjs
            data: {
              text: assumption.text,
              argumentId,
              defaultEditing: false,
              size: {
                width: nodeStartingDimensions.width,
                height: nodeStartingDimensions.height
              }, // Initialize size with default values
              nodeNumber: getNodeNumber('assumption'),
            },
            style: { ...customNodeStyle, visibility: 'hidden' as 'hidden' },
          };
          allNodes.push(assumptionNode);

          allEdges.push({
            id: getNodeID('edge'),
            source: premiseNode.id,
            target: assumptionNode.id,
            sourceHandle: `${premiseNode.id}-out`,
            targetHandle: `${assumptionNode.id}-in`,
            data: { argumentId },
          });
        });
    });
  });

  // Add new nodes and edges to the store
  allNodes.forEach((node) => {
    if (node.id !== rootNodeId) addNode(node)
  });

  // Measure sizes and update the store
  setTimeout(async () => {
    // Perform the layout
    const updatedNodes = await performElkLayout({ nodes: useStore.getState().nodes, edges: allEdges }, rootNodeId, argumentId);

    // Apply positions after ensuring DOM is ready
    requestAnimationFrame(() => {
      updatedNodes.forEach((updatedNode) => {
        if (updatedNode.id !== rootNodeId) {
          useStore.getState().setNodePosition(updatedNode.id, updatedNode.position);
          useStore.getState().addNodeStyle(updatedNode.id, 'visibility', 'visible' );
        }
      });
    });

    // Now that the nodes have been positioned, add the edges
    allEdges.forEach((edge) => addEdge(edge));

  }, 0); // Timeout ensures DOM updates are completed
};

export const initiateArgument = async (input: string, argumentId: string, rootNodeId: string) => {
  const {
    setArgumentConversationHistory,
  } = useStore.getState();

  const conversationHistory = useStore.getState().arguments[argumentId]?.conversationHistory || [];

  try {
    const updatedHistory: ConversationEntry[] = [...conversationHistory, { role: 'user', content: makeInputPrompt(input) }];
    const gptResponse = await fetchGPTResponse(updatedHistory);
    const responseContent = gptResponse.choices[0]?.message?.content || 'No response received.';
    console.log("responseContent:", responseContent);

    const updatedHistoryWithResponse: ConversationEntry[] = [...updatedHistory, { role: 'system', content: responseContent }];

    const parsedArguments: ParsedArgument[] = parseArgumentResponse(responseContent);
    console.log("parsedArguments: " + JSON.stringify(parsedArguments));

    createNodesAndEdges(parsedArguments, argumentId, rootNodeId);
    setArgumentConversationHistory(argumentId, updatedHistoryWithResponse);
  } catch (error) {
    console.error("Error fetching GPT response:", error);
  }
};