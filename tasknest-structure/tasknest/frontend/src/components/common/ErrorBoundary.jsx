import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          background: 'var(--color-bg-secondary)',
          color: 'var(--color-text-primary)',
          borderRadius: 'var(--radius-lg)',
          margin: '20px',
          fontFamily: 'var(--font-family)'
        }}>
          <h2 style={{ color: 'var(--color-danger)', marginBottom: '16px' }}>
            Oops! Something went wrong
          </h2>
          <p style={{ marginBottom: '24px', color: 'var(--color-text-secondary)' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              background: 'var(--color-primary)',
              color: 'var(--color-text-inverse)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              fontFamily: 'var(--font-family)'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;