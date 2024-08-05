// src/components/nodes/PremiseNode.tsx

import React from 'react';
import BaseNode from './BaseNode';
import { Position, NodeProps } from 'reactflow';


const PremiseNode: React.FC<NodeProps> = ({ id, data }) => {
  return (
    <BaseNode id={id} label={"Premise"} initialText={data.text} handles={[{ type: 'target', position: Position.Top, id: 'in' }, { type: 'source', position: Position.Bottom, id: 'out' }]} />
  );
}

export default PremiseNode;