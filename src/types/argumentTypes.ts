// src/types/argumentTypes.ts

export interface Assumption {
  text: string;
  premiseIndex: number;
}

export interface ParsedArgument {
  conclusion: string;
  premises: string[];
  assumptions: Assumption[];
  validity: string;
  argumentStatus: string;
}

export interface ConversationEntry {
  role: string;
  content: string;
}

export interface TreeNode {
  type: string;
  data: {
    text: string;
    argumentId: string;
  };
  position: { x: number; y: number };
  children: TreeNode[];
}