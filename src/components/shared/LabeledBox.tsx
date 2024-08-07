// src/components/shared/LabeledBox.tsx

import React from 'react';
import { Container, Label } from './styles/labeledBox';
import { FlexColumn } from './styles/flexColumn';

interface LabeledBoxProps {
  label: string;
  children: React.ReactNode;
  $editing: boolean;
}

const LabeledBox: React.FC<LabeledBoxProps> = ({ label, children, $editing }) => (
  <Container $editing={$editing}>
    <Label>{label}</Label>
    <FlexColumn>
      {children}
    </FlexColumn>
  </Container>
);

export default LabeledBox;