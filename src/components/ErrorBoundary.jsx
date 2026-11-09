import React from 'react';

/**
 * Global/Section-Level Error Boundary to prevent white screen crashes (WSOD)
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else if (typeof window !== 'undefined') {
      window.location.href = '/meetings';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="list-container"
          style={{
            padding: '40px 20px',
            textAlign: 'center',
            maxWidth: '480px',
            margin: '0 auto'
          }}
        >
          <div
            className="card-box"
            style={{
              padding: '24px 20px',
              border: '1px solid #fed7aa',
              background: '#fffbf5',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.08)'
            }}
          >
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚠️</div>
            <h3
              style={{
                fontSize: '17px',
                fontWeight: 700,
                color: '#9a3412',
                marginBottom: '8px'
              }}
            >
              일시적인 화면 로딩 오류가 발생했습니다
            </h3>
            <p
              className="muted-text"
              style={{
                fontSize: '13.5px',
                lineHeight: '1.5',
                color: '#7c2d12',
                marginBottom: '20px'
              }}
            >
              안전하게 모임 데이터 정합성을 보호하고 있습니다.<br />
              아래 버튼을 눌러 목록으로 돌아가거나 다시 시도해 주세요.
            </p>
            <div
              style={{
                display: 'flex',
                gap: '10px',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}
            >
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.reload();
                  }
                }}
              >
                새로고침
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={this.handleReset}
              >
                일정 목록으로 이동
              </button>
            </div>
            {this.props.showDetails && this.state.error && (
              <pre
                style={{
                  marginTop: '16px',
                  padding: '8px',
                  background: '#f8fafc',
                  fontSize: '11px',
                  textAlign: 'left',
                  overflowX: 'auto',
                  borderRadius: '6px'
                }}
              >
                {String(this.state.error?.message || this.state.error)}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
