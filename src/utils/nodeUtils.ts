// src/utils/nodeUtils.ts

import { labeledBoxContainerBorderWidth, labeledBoxContainerPadding } from "../components/shared/styles/labeledBox";
import { customNodeStyle } from "../components/shared/styles/nodeStyles";
import theme from "../theme";

export const nodeStartingDimensions: { width: number, height: number } = { width: 200, height: 100 };
const CHARS_BEFORE_WRAP = 60; // For wrapping text in llm generated nodes

/*
  Create a hidden node and its inner textarea for width calculation

  The elements are created in the module scope, so they are initialized only once when the module is
  first imported. Therefore, they won't be repeatedly created and destroyed every time calculateNodeWidth
  is called. Additionally, they are positioned off-screen and set to be invisible to ensure they do not
  interfere with the layout or rendering of the visible parts of the application.
*/
const hiddenNode = document.createElement('div');
Object.assign(hiddenNode.style, customNodeStyle);
hiddenNode.style.position = 'absolute';
hiddenNode.style.left = '-9999px';
hiddenNode.style.top = '-9999px';
hiddenNode.style.visibility = 'hidden';


const hiddenTextArea = document.createElement('textarea');
Object.assign(hiddenTextArea.style, {
  visibility: 'hidden',
  whiteSpace: 'pre',
  fontSize: theme.typography.fontSize,
  fontFamily: theme.typography.fontFamily,
  padding: `${labeledBoxContainerPadding}`,
  borderWidth: `${labeledBoxContainerBorderWidth}`,
  overflow: 'hidden',
});

hiddenNode.appendChild(hiddenTextArea);
document.body.appendChild(hiddenNode)

// Replace the text in the hiddenTextArea and update its width
const putHiddenText = (text: string) => {
  hiddenTextArea.value = text;
  hiddenTextArea.style.width = 'auto'; // Reset width to auto to accurately measure new content
  hiddenTextArea.style.width = `${hiddenTextArea.scrollWidth}px`; // Set width based on scrollWidth
  hiddenTextArea.style.height = 'auto';
  hiddenTextArea.style.height = `${hiddenTextArea.scrollHeight}px`;
}

export const calculateNodeDimensions = (text: string): { width: number, height: number } => {
  putHiddenText(wrapText(text));
  return { width: hiddenNode.offsetWidth, height: hiddenNode.offsetHeight };
};

// Wrap text after CHARS_BEFORE_WRAP characters without breaking words
export const wrapText = (text: string) => text.replace(
    new RegExp(`(?![^\\n]{1,${CHARS_BEFORE_WRAP}}$)([^\\n]{1,${CHARS_BEFORE_WRAP}})\\s`, 'g'), '$1\n'
);