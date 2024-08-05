// src/types/argumentTypes.ts

interface Assumption {
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