// src/components/nodes/BaseNode.tsx

import React, { useEffect, useRef, useState } from 'react';
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
  defaultEditing?: boolean;
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

const BaseNode: React.FC<BaseNodeProps> = ({ id, label, handles, position, initialText = "", defaultEditing = true, onSubmit }) => {
  const [text, setText] = useState(initialText);
  const [editing, setEditing] = useState<boolean>(defaultEditing);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnections = useStore((state) => state.handleConnections);
  const textAreaRef: React.RefObject<HTMLTextAreaElement> = useRef(null);

  useEffect(() => {
    const textArea = textAreaRef.current;
    if (textArea) {
      // Run the initial dimension calculations after a short delay to ensure DOM is ready.
      // Otherwise some text in generated nodes may be cut off
      // TODO: Find a better way to ensure text in generated nodes is displayed in full on first render. Low importance.
      setTimeout(() => {
        textArea.style.height = 'auto';
        textArea.style.height = `${textArea.scrollHeight}px`;

        textArea.style.width = 'auto';
        textArea.style.width = `${textArea.scrollWidth}px`;
      }, 100);
    }
  }, []);


  useEffect(() => {
    const textArea = textAreaRef.current;
    if (textArea) {
      // Recalculation after the component mounts
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
    <FlexColumn style={{gap: `${theme.spacing.medium}`}}>
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
                fontSize: `${theme.typography.fontSize}`,
              }}
            />
          </NoBorderWrapper>
        </LabeledBox>
        {handles.map((handle, index) => (
        <StyledHandleWithLabel key={index} $position={handle.position}>
          <StyledHandle
            type={handle.type}
            position={handle.position}
            id={handle.id}
            $isConnected={handleConnections[handle.id!]}
          />
          <HandleLabel $position={handle.position}>{handle.id}</HandleLabel>
        </StyledHandleWithLabel>
        ))}
      </FlexColumn>
    </FlexColumn>
  );
}

export default BaseNode;