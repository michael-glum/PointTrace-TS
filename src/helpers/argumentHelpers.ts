// src/helpers/argumentHelpers.ts

import { useStore } from '../store/store';
import { makeInputPrompt } from '../utils/promptUtils';
import { fetchGPTResponse } from '../services/openai';
import { parseArgumentResponse } from '../utils/parseArgumentResponse';
import { ParsedArgument, ConversationEntry } from '../types/argumentTypes';
import { Node, Edge } from 'reactflow';
import { customNodeStyle } from '../components/shared/styles/nodeStyles';
import { nodeStartingDimensions } from '../utils/nodeUtils';
import { createAutoLayout } from '../utils/autoLayout';

const createNodesAndEdges = async (
  parsedArguments: ParsedArgument[],
  argumentId: string,
  rootNodeId: string,
) => {
  const { getNodeID, getNodeNumber, addNode, addEdge } = useStore.getState();

  const nodeChildren: Map<string, string[]> = new Map();

  const allNodes: Node[] = [];
  const allEdges: Edge[] = [];

  const rootNode = useStore.getState().nodes.find((node: Node) => node.id === rootNodeId);
  allNodes.push(rootNode!);

  parsedArguments.forEach((arg) => {
    const conclusionNode = {
      id: getNodeID('conclusion'),
      type: 'conclusion',
      position: { x: 0, y: 0 }, // Position will be set by auto layout
      data: {
        text: arg.conclusion,
        argumentId,
        defaultEditing: false,
        size: {
          width: nodeStartingDimensions.width,
          height: nodeStartingDimensions.height
        },
        nodeNumber: getNodeNumber('conclusion'),
        totalWidthOfChildren: 0,
        rightSpacing: 0,
      },
      style: { ...customNodeStyle, visibility: 'hidden' as 'hidden' },
      parentId: rootNodeId,
    };
    allNodes.push(conclusionNode);
    nodeChildren.set(rootNodeId, [conclusionNode.id]);
    nodeChildren.set(conclusionNode.id, []);

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
        position: { x: 0, y: 0 },
        data: {
          text: premise,
          argumentId,
          defaultEditing: false,
          size: {
            width: nodeStartingDimensions.width,
            height: nodeStartingDimensions.height
          },
          nodeNumber: getNodeNumber('premise'),
          totalWidthOfChildren: 0,
          rightSpacing: 0,
        },
        style: { ...customNodeStyle, visibility: 'hidden' as 'hidden' },
        parentId: conclusionNode.id,
      };
      allNodes.push(premiseNode);
      nodeChildren.set(premiseNode.id, []);
      const currChildren = nodeChildren.get(conclusionNode.id) || [];
      currChildren.push(premiseNode.id)
      nodeChildren.set(conclusionNode.id, currChildren);

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
            position: { x: 0, y: 0 },
            data: {
              text: assumption.text,
              argumentId,
              defaultEditing: false,
              size: {
                width: nodeStartingDimensions.width,
                height: nodeStartingDimensions.height
              },
              nodeNumber: getNodeNumber('assumption'),
              totalWidthOfChildren: 0,
              rightSpacing: 0,
            },
            style: { ...customNodeStyle, visibility: 'hidden' as 'hidden' },
            parentId: premiseNode.id,
          };
          allNodes.push(assumptionNode);
          nodeChildren.set(assumptionNode.id, []);
          const currChildren = nodeChildren.get(premiseNode.id) || [];
          currChildren.push(assumptionNode.id);
          nodeChildren.set(premiseNode.id, currChildren);

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
    const updatedNodes = createAutoLayout(useStore.getState().nodes, nodeChildren, rootNodeId);
    console.log("updatedNodes:", updatedNodes)

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