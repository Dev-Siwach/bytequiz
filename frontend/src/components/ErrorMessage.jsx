import React from 'react';

const ErrorMessage = ({ message }) => {
  if (!message) return null;

  return (
    <div style={{
      background: '#fff5f5',
      border: '1px solid #ffc9c9',
      color: 'var(--color-danger)',
      borderRadius: 'var(--radius-sm)',
      padding: '12px 16px',
      marginBottom: '16px'
    }}>
      {message}
    </div>
  );
};

export default ErrorMessage;
