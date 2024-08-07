// src/components/shared/styles/labeledBox.js

import styled from 'styled-components';

export const textContainerBorderWidth = 1;

export const Container = styled.div<{ $editing: boolean }>`
  border: ${textContainerBorderWidth}px solid ${({theme, $editing}) => $editing ? theme.colors.secondary : theme.colors.background };
  border-radius: ${({theme}) => theme.borderRadius};
  padding: ${({theme}) => theme.spacing.small};
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