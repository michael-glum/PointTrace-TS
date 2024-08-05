// src/GlobalStyle.ts

import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
    
  html, body, #root {
    height: 100%;
  }
    
  @font-face {
    font-family: 'Satoshi';
    src: url('./fonts/Satoshi-Variable.ttf') format('truetype');
    font-weight: 100 900;
    font-style: normal;
  }

  body {
    font-family: ${({ theme }) => theme.typography.fontFamily};
    font-size: ${({ theme }) => theme.typography.fontSize};
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

export default GlobalStyle;