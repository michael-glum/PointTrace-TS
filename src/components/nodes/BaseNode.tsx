// src/components/nodes/BaseNode.tsx

import React, { useEffect, useRef, useState } from 'react';
import { HandleProps } from 'reactflow';
import { useStore } from '../../store';
import { NodeHeader } from '../shared/styles/nodeStyles';
import { StyledHandleWithLabel, StyledHandle, HandleLabel } from '../shared/styles/handleStyles';
import { FlexColumn } from '../shared/styles/flexColumn';
import { NoBorderWrapper } from '../shared/styles/noBorderWrapper';
import theme from '../../theme';
import LabeledBox from '../shared/LabeledBox';
import { FaPencilAlt, FaCheck } from 'react-icons/fa';

interface BaseNodeProps {
  id: string;
  label: string;
  handles: HandleProps[];
  position?: { x: number; y: number };
  initialText?: string;
  onSubmit?: (...args: any[]) => void;
}

const BaseNode: React.FC<BaseNodeProps> = ({ id, label, handles, position, initialText, onSubmit }) => {
  const [text, setText] = useState(initialText || "");
  const [editing, setEditing] = useState(true);

  const edges = useStore((state) => state.edges);
  const textAreaRef: React.RefObject<HTMLTextAreaElement> = useRef(null);

  const isHandleConnected = (handleId: string) => {
    return edges.some((edge) => edge.sourceHandle === handleId || edge.targetHandle === handleId);
  };

  const [connectedHandles, setConnectedHandles] = useState<string[]>([]);

  useEffect(() => {
    const connectedHandles = handles.map(handle => `${id}-${handle.id}`).filter(isHandleConnected);
    setConnectedHandles(connectedHandles);
  }, [edges, handles, id]);

  useEffect(() => {
    const textArea = textAreaRef.current;
    if (textArea) {
      textArea.style.height = 'auto';
      textArea.style.height = `${textArea.scrollHeight}px`;

      textArea.style.width = 'auto';
      textArea.style.width = `${textArea.scrollWidth}px`;
    }
  }, [text]);

  const handleToggleEdit = async () => {
    if (editing && onSubmit) {
      await onSubmit(id, text, { position });
    }
    setEditing(!editing);
  };

  return (
    <>
      <NodeHeader>
        <span>{label}</span>
        <button onClick={handleToggleEdit} style={{ right: '0', background: 'none', border: 'none', cursor: 'pointer', color: `${theme.colors.secondary}` }}>
          {editing ? <FaCheck /> : <FaPencilAlt />}
        </button>
      </NodeHeader>
      <FlexColumn>
        <LabeledBox label={"Text"} editing={editing}>
          <NoBorderWrapper>
            <textarea
              ref={textAreaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              readOnly={!editing}
              style={{
                resize: 'none',
                overflow: 'hidden',
                whiteSpace: 'pre',
                fontFamily: `${theme.typography.fontFamily}`,
              }}
            />
          </NoBorderWrapper>
        </LabeledBox>
        {handles.map((handle, index) => (
        <StyledHandleWithLabel key={index} $position={handle.position}>
          <StyledHandle
            type={handle.type}
            position={handle.position}
            id={`${id}-${handle.id}`}
            $isConnected={connectedHandles.includes(`${id}-${handle.id}`)}
          />
          <HandleLabel $position={handle.position}>{handle.id}</HandleLabel>
        </StyledHandleWithLabel>
        ))}
      </FlexColumn>
    </>
  );
}

export default BaseNode;