// src/components/shared/styles/handleStyles.ts

import styled, { css } from 'styled-components';
import { Handle, Position } from 'reactflow';

interface StyledHandleWithLabelProps {
  $position: Position.Top | Position.Bottom | Position.Left | Position.Right;
}

interface StyledHandleProps {
  $isConnected: boolean;
}

interface HandleLabelProps {
  $position: Position.Top | Position.Bottom | Position.Left | Position.Right;
}

export const StyledHandleWithLabel = styled.div<StyledHandleWithLabelProps>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  ${css`
    right: 50%;
  `}
  ${({ $position }) => $position === Position.Top && css`
    top: -2px;
  `}
  ${({ $position }) => $position === Position.Bottom && css`
    bottom: -2px;
  `}
`;

export const StyledHandle = styled(Handle)<StyledHandleProps>`
  width: 10px;
  height: 10px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  background: ${({ $isConnected, theme }) => $isConnected ? theme.colors.primary : theme.colors.background};
`;

export const HandleLabel = styled.div<HandleLabelProps>`
  position: absolute;
  white-space: nowrap;
  color: ${({ theme }) => theme.colors.text};
  font-size: 12px;
  pointer-events: none;
  margin-top: 30px;
  ${({ $position }) => $position === Position.Top && css`
    top: 100%;
    margin-top: -15px;
  `}
  ${({ $position }) => $position === Position.Bottom && css`
    bottom: 100%;
    margin-bottom: -15px;
  `}
  ${css`
    right: -20px;
    left: 20px;
  `}
`;