// src/components/shared/LabeledBox.tsx

import React from 'react';
import { Container, Label, Content } from './styles/labeledBox';

interface LabeledBoxProps {
  label: string;
  children: React.ReactNode;
  $editing: boolean;
}

const LabeledBox: React.FC<LabeledBoxProps> = ({ label, children, $editing }) => (
  <Container $editing={$editing}>
    <Label>{label}</Label>
    <Content>
      {children}
    </Content>
  </Container>
);

export default LabeledBox;