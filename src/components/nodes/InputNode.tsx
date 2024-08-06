// src/components/nodes/InputNode.tsx

import React from 'react';
import BaseNode from './BaseNode';
import { Position, NodeProps } from 'reactflow';
import { initiateArgument } from '../../helpers/argumentHelpers';


const InputNode: React.FC<NodeProps> = ({ id, xPos, yPos }) => {
  const handleSubmit = async (nodeId: string, input: string, options: { position: { x: number; y: number } }) => {
    const argumentId = `argument-${id}`; // This should be generated or fetched appropriately
    await initiateArgument(input, argumentId, nodeId, options.position);
  };

  return (
    <BaseNode
      id={id}
      label={"Input"}
      handles={[
        { type: 'source', position: Position.Bottom, id: `${id}-out` }
      ]}
      position={{x: xPos, y: yPos}}
      onSubmit={handleSubmit}
    />
  );
}

export default InputNode;