// src/components/workspace/Sidebar.tsx

import React from 'react';
import { SidebarNode } from './SidebarNode';
import theme from '../../theme';
import { FlexColumn } from '../shared/styles/flexColumn';

const Sidebar: React.FC = () => {
  return (
    <FlexColumn
      style={{
        width: '200px',
        height: '100%',
        padding: `${theme.spacing.medium}`,
        paddingTop: '28px',
        gap: `${theme.spacing.medium}`,
        borderRight: `1px solid ${theme.colors.secondaryBorder}`,
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          fontSize: '18px',
          fontWeight: '450'
        }}
      >
        Nodes
      </div>
      <FlexColumn
        style={{
          borderTop: `1px solid ${theme.colors.secondaryBorder}`,
          padding: `${theme.spacing.medium}`,
          width: '100%',
          height: '100%',
          overflow: 'hidden'
        }}
      >
        <SidebarNode type='input' label="Input" />
        <SidebarNode type='conclusion' label="Conclusion" />
        <SidebarNode type='premise' label="Premise" />
        <SidebarNode type='assumption' label="Assumption" />
      </FlexColumn>
    </FlexColumn>
  );
};

export default Sidebar;