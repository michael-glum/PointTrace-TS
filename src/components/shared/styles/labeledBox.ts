// src/components/shared/styles/labeledBox.js

import styled from 'styled-components';
import theme from '../../../theme';

export const labeledBoxContainerBorderWidth = 1;
export const labeledBoxContainerPadding = theme.spacing.small;

export const Container = styled.div<{ $editing: boolean }>`
  border: ${labeledBoxContainerBorderWidth}px solid ${({theme, $editing}) => $editing ? theme.colors.secondary : theme.colors.background };
  border-radius: ${({theme}) => theme.borderRadius};
  padding: ${labeledBoxContainerPadding};
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 100%;
  box-sizing: border-box;
`;

export const Label = styled.div`
  font-size: ${({theme}) => theme.typography.fontSizeSmall};
  align-self: flex-start;
`;