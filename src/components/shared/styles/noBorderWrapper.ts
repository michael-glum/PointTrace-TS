// src/components/shared/styles/noBorderWrapper.ts

import styled from 'styled-components';

export const NoBorderWrapper = styled.div`
  input, select, textarea {
    border: none;
    outline: none;
    width: 100%;
    box-sizing: border-box;
  }
`;