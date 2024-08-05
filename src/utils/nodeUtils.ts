// src/utils/nodeUtils.ts

import theme from "../theme";

export const nodeStartingDimensions: { width: number, height: number } = { width: 200, height: 100 };

const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
if (context) {
  context.font = `${theme.typography.fontSize} ${theme.typography.fontFamily}`;
}

const getTextWidth = (text: string): number => {
  if (!context) return 0;

  const lines = text.split('\n');
  let maxWidth = 0;

  lines.forEach(line => {
    const width = context.measureText(line).width;
    maxWidth = Math.max(maxWidth, width);
  });

  return maxWidth;
}

export const calculateNodeWidth = (text: string): number => {
  return getTextWidth(text) + parseInt(theme.spacing.medium) + parseInt(theme.spacing.small);
};