// src/components/shared/styles/flexColumn.ts

import styled from 'styled-components';
import theme from '../../../theme';

export const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.small};
  width: auto;
  height: auto;
`;