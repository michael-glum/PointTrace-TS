// src/components/shared/styles/nodeStyles.ts

import styled from 'styled-components';
import theme from '../../../theme';

export const customNodeStyle = {
  width: 'auto',
  minWidth: '200px',
  height: 'auto',
  border: `2px solid ${theme.colors.border}`,
  padding: `${theme.spacing.medium}`,
  backgroundColor: `${theme.colors.background}`,
  borderRadius: `${theme.borderRadius}`,
  color: `${theme.colors.text}`,
  boxShadow: `0 4px 8px rgba(0, 0, 0, 0.1)`,
  fontFamily: `${theme.typography.fontFamily}`,
  gap: `${theme.spacing.medium}`
};

export const NodeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.fontSize};
  color: ${({ theme }) => theme.colors.primary};
  text-align: left;
  font-weight: 500;
`;

export const standaloneStyle = {
  fontSize: '12px',
  display: 'inline-block',
  minWidth: '100px',
  width: 'auto'
};

export const spinnerStyle = {
  color: `${theme.colors.secondary}`,
  animation: 'spin 1s linear infinite'
};

export const keyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;