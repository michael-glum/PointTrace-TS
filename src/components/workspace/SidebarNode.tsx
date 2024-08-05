// src/components/workspace/SidebarNode.tsx

import React, { DragEvent } from 'react';
import styled from 'styled-components';

interface SidebarNodeProps {
  type: string;
  label: string;
}

const SidebarNodeWrapper = styled.div`
  cursor: 'grab';
  min-width: 100px;
  height: 60px;
  display: flex;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme }) => theme.colors.background};
  justify-content: center;
  flex-direction: column;
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
`;

export const SidebarNode: React.FC<SidebarNodeProps> = ({ type, label }) => {
  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: string) => {
    const appData = { nodeType };
    event.currentTarget.style.cursor = 'grabbing';
    event.dataTransfer.setData('application/reactflow', JSON.stringify(appData));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <SidebarNodeWrapper
      className={type}
      onDragStart={(event) => onDragStart(event, type)}
      onDragEnd={(event) => (event.currentTarget.style.cursor = 'grab')}
      draggable
    >
        <span>{label}</span>
    </SidebarNodeWrapper>
  );
}