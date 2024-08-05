// src/components/shared/styles/labeledBox.js

import styled from 'styled-components';

export const Container = styled.div<{ editing: boolean }>`
  border: 1px solid ${({theme, editing}) => editing ? theme.colors.secondary : theme.colors.background };
  border-radius: ${({theme}) => theme.borderRadius};
  padding: ${({theme}) => theme.spacing.small};
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
`;

export const Label = styled.div`
  font-size: 12px;
  margin-bottom: 1px;
  align-self: flex-start;
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
`;