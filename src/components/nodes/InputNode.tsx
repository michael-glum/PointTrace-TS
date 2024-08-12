// src/components/nodes/InputNode.tsx

import React from 'react';
import BaseNode from './BaseNode';
import { Position, NodeProps } from 'reactflow';
import { initiateArgument } from '../../helpers/argumentHelpers';


const InputNode: React.FC<NodeProps> = ({ id, xPos, yPos, data }) => {
  const handleSubmit = async (nodeId: string, input: string) => {
    const argumentId = `argument-${id}`;
    await initiateArgument(input, argumentId, nodeId);
  };

  return (
    <BaseNode
      id={id}
      label={`Input ${data.nodeNumber}`}
      handles={[
        { type: 'source', position: Position.Bottom, id: `${id}-out` }
      ]}
      position={{x: xPos, y: yPos}}
      onSubmit={handleSubmit}
    />
  );
}

export default InputNode;