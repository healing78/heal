import React from 'react';

/**
 * Global/Section-Level Error Boundary to prevent white screen crashes (WSOD)
 * Provides one-click error copying for easy troubleshooting.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, copied: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error, copied: false };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, copied: false });
    if (this.props.onReset) {
      this.props.onReset();
    } else if (typeof window !== 'undefined') {
      window.location.href = '/meetings';
    }
  };

  handleCopyError = async () => {
    const err = this.state.error;
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const now = new Date().toISOString();

    const textToCopy = [
      `[Healing78 런타임 오류 리포트]`,
      `일시: ${now}`,
      `URL: ${url}`,
      `오류 메시지: ${String(err?.message || err)}`,
      `--- Stack Trace ---`,
      String(err?.stack || 'No stack trace available'),
      `--- User Agent ---`,
      userAgent
    ].join('\n');

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2500);
    } catch (e) {
      console.warn('Failed to copy error to clipboard:', e);
      alert('오류 내용:\n' + textToCopy);
    }
  };

  render() {
    if (this.state.hasError) {
      const { copied, error } = this.state;
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
                marginBottom: '16px'
              }}
            >
              안전하게 모임 데이터 정합성을 보호하고 있습니다.<br />
              아래 버튼을 눌러 목록으로 돌아가거나 오류를 복사해 전달해 주세요.
            </p>

            <div
              style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginBottom: '16px'
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
              <button
                type="button"
                className="btn btn-sm"
                style={{
                  background: copied ? '#10b981' : '#f97316',
                  color: '#ffffff',
                  borderColor: 'transparent',
                  fontWeight: 600
                }}
                onClick={this.handleCopyError}
              >
                {copied ? '오류 복사 완료! ✓' : '📋 오류 내용 복사'}
              </button>
            </div>

            {error && (
              <details
                style={{
                  marginTop: '12px',
                  textAlign: 'left',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '12px'
                }}
                open
              >
                <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#b91c1c' }}>
                  오류 내용: {String(error?.message || error)}
                </summary>
                <div style={{ marginTop: '8px', textAlign: 'right' }}>
                  <button
                    type="button"
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      cursor: 'pointer'
                    }}
                    onClick={this.handleCopyError}
                  >
                    {copied ? '복사됨 ✓' : '전체 복사'}
                  </button>
                </div>
                <pre
                  style={{
                    marginTop: '6px',
                    fontSize: '11px',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    color: '#64748b'
                  }}
                >
                  {String(error?.stack || '')}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
