// src/theme.ts

import { DefaultTheme } from "styled-components";

const theme: DefaultTheme = {
  colors: {
    primary: '#1E90FF',
    secondary: '#BBBBBB',
    text: '#333333',
    background: '#FFFFFF',
    border: '#66B2FF',
  },
  typography: {
    fontFamily: "Satoshi, sans-serif",
    fontSize: '14px',
    lineHeight: '1.5',
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px',
  },
  borderRadius: '8px',
};

export default theme;