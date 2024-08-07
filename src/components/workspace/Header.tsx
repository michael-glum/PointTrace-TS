import React, { CSSProperties, ReactNode } from 'react';
import theme from '../../theme';

interface CenteredBoxProps {
  style?: CSSProperties;
  children: ReactNode;
}

const CenteredBox: React.FC<CenteredBoxProps> = ({ children, style }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
  
  const Header: React.FC = () => {
    return (
      <div
        style={{
          height: '64px',
          boxShadow: 'none',
          backgroundColor: '#242526',
          borderBottom: '1px solid #e0e0e0',
          color: 'white',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: `0 ${theme.spacing.medium}`,
          boxSizing: 'border-box',
        }}
      >
        <CenteredBox style={{ transform: 'translateX(-2%)' }}>
          {/* Placeholder for Icon */}
          <svg
            style={{ marginRight: '8px', width: '24px', height: '24px', fill: 'white' }}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-2.5-2.5 1.41-1.41L10 13.17l5.09-5.09 1.41 1.41L10 16.5z" />
          </svg>
          <span
            style={{
              fontSize: '1.25rem',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            PointTrace
          </span>
        </CenteredBox>
      </div>
    );
  };
  
  export default Header;