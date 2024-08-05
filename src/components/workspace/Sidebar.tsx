// src/components/workspace/Sidebar.tsx

import React from 'react';
import { SidebarNode } from './SidebarNode';

const Sidebar: React.FC = () => {
  return (
    <div
      style={{
        width: '200px',
        backgroundColor: '#FFFFFF',
        height: '100%',
        padding: '16px',
        borderRight: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ marginBottom: '16px', textAlign: 'center', fontSize: '18px', fontWeight: '450' }}>Nodes</div>
      <div
        style={{
          borderTop: '1px solid #e0e0e0',
          padding: '16px',
          width: '100%',
          height: 'calc(100% - 64px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        <SidebarNode type='input' label="Input" />
        <SidebarNode type='conclusion' label="Conclusion" />
        <SidebarNode type='premise' label="Premise" />
        <SidebarNode type='assumption' label="Assumption" />
      </div>
    </div>
  );
};

export default Sidebar;