// src/components/nodes/AssumptionNode.tsx

import React from 'react';
import BaseNode from './BaseNode';
import { Position, NodeProps } from 'reactflow';


const AssumptionNode: React.FC<NodeProps> = ({ id, data }) => {
  return (
    <BaseNode
      id={id}
      label={`Assumption ${data.nodeNumber}`}
      initialText={data.text}
      defaultEditing={data.defaultEditing}
      handles={[
        { type: 'target', position: Position.Top, id: `${id}-in` },
        { type: 'source', position: Position.Bottom, id: `${id}-out` }
      ]}
    />
  );
}

export default AssumptionNode;