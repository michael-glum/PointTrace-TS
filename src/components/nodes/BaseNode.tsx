// src/components/nodes/BaseNode.tsx

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { HandleProps } from 'reactflow';
import { useStore } from '../../store';
import { keyframes, NodeHeader, spinnerStyle } from '../shared/styles/nodeStyles';
import { StyledHandleWithLabel, StyledHandle, HandleLabel } from '../shared/styles/handleStyles';
import { FlexColumn } from '../shared/styles/flexColumn';
import { NoBorderWrapper } from '../shared/styles/noBorderWrapper';
import theme from '../../theme';
import LabeledBox from '../shared/LabeledBox';
import { FaPencilAlt, FaCheck, FaSpinner } from 'react-icons/fa';

interface BaseNodeProps {
  id: string;
  label: string;
  handles: HandleProps[];
  position?: { x: number; y: number };
  initialText?: string;
  onSubmit?: (...args: any[]) => void;
}

const injectKeyframes = () => {
  if (!document.getElementById('spinner-keyframes')) {
    const style = document.createElement('style');
    style.id = 'spinner-keyframes';
    style.innerHTML = keyframes;
    document.head.appendChild(style);
  }
};

const BaseNode: React.FC<BaseNodeProps> = ({ id, label, handles, position, initialText, onSubmit }) => {
  const [text, setText] = useState(initialText || "");
  const [editing, setEditing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectedHandles, setConnectedHandles] = useState<string[]>([]);

  const edges = useStore((state) => state.edges);
  const textAreaRef: React.RefObject<HTMLTextAreaElement> = useRef(null);

  const isHandleConnected = useCallback(
    (handleId: string) => {
      return edges.some((edge) => edge.sourceHandle === handleId || edge.targetHandle === handleId);
    },
    [edges]
  );

  useEffect(() => {
    const textArea = textAreaRef.current;
    if (textArea) {
      textArea.style.height = 'auto';
      textArea.style.height = `${textArea.scrollHeight}px`;

      textArea.style.width = 'auto';
      textArea.style.width = `${textArea.scrollWidth}px`;
    }
  }, [text]);

  useEffect(() => {
    injectKeyframes(); // Inject keyframes when the component mounts
  }, []);

  const handleToggleEdit = async () => {
    if (editing && onSubmit) {
      setLoading(true);
      setError(null);
      try {
        await onSubmit(id, text, { position });
      } catch (err) {
        setError('Failed to submit');
      } finally {
        setLoading(false);
      }
    }
    setEditing(!editing);
  };

  return (
    <>
      <NodeHeader>
        <span>{label}</span>
        <button
          onClick={handleToggleEdit}
          style={{ right: '0', background: 'none', border: 'none', cursor: 'pointer', color: `${theme.colors.secondary}` }}
          disabled={loading}
        >
          {loading ? <FaSpinner style={spinnerStyle} /> : (editing ? <FaCheck /> : <FaPencilAlt />)}
        </button>
      </NodeHeader>
      <FlexColumn>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <LabeledBox label={"Text"} $editing={editing}>
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
            $isConnected={isHandleConnected(`${id}-${handle.id}`)}
          />
          <HandleLabel $position={handle.position}>{handle.id}</HandleLabel>
        </StyledHandleWithLabel>
        ))}
      </FlexColumn>
    </>
  );
}

export default BaseNode;