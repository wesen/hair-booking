import type { ReactNode, CSSProperties } from 'react';

interface IntakeShellProps {
  step: number;
  total: number;
  title: string;
  eyebrow?: string;
  children?: ReactNode;
  style?: CSSProperties;
  onNext?: () => void;
  nextLabel?: string;
  onSkip?: () => void;
  onBack?: () => void;
}

// Content shell for the 9-step intake flow.
// No StatusBar / HomeIndicator — just the scrollable page with a bottom CTA bar.
// Pages render their own header chrome as needed.

export function IntakeShell({
  step,
  total,
  title,
  eyebrow,
  children,
  style,
  onNext,
  nextLabel = 'Keep going →',
  onSkip,
  onBack,
}: IntakeShellProps) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--fringe-color-paper, #faf8f5)',
      display: 'flex',
      flexDirection: 'column',
      ...style,
    }}>
      {/* Page content */}
      <div style={{ flex: 1 }}>{children}</div>

      {/* Bottom CTA bar */}
      {onNext && (
        <div style={{
          padding: '16px 24px 24px',
          borderTop: '1px solid var(--fringe-color-rule, #e8e3da)',
          display: 'flex',
          gap: 10,
          background: 'var(--fringe-color-paper, #faf8f5)',
        }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                fontFamily: 'var(--fringe-font-block, "Anton", sans-serif)',
                fontSize: 14,
                letterSpacing: 1,
                textTransform: 'uppercase',
                padding: '12px 16px',
                border: '1px solid var(--fringe-color-rule, #e8e3da)',
                background: 'transparent',
                color: 'var(--fringe-color-ink, #111111)',
                cursor: 'pointer',
              }}
            >
              ← Back
            </button>
          )}
          {onSkip && (
            <button
              onClick={onSkip}
              style={{
                fontFamily: 'var(--fringe-font-block, "Anton", sans-serif)',
                fontSize: 14,
                letterSpacing: 1,
                textTransform: 'uppercase',
                padding: '12px 16px',
                border: '1px solid var(--fringe-color-rule, #e8e3da)',
                background: 'transparent',
                color: 'var(--fringe-color-soft, #9a958e)',
                cursor: 'pointer',
              }}
            >
              Skip
            </button>
          )}
          <button
            onClick={onNext}
            style={{
              fontFamily: 'var(--fringe-font-block, "Anton", sans-serif)',
              fontSize: 14,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              padding: '14px 20px',
              border: 'none',
              background: 'var(--fringe-color-plum, #6b3a4a)',
              color: 'var(--fringe-color-paper, #faf8f5)',
              cursor: 'pointer',
              flex: 1,
            }}
          >
            {nextLabel}
          </button>
        </div>
      )}
    </div>
  );
}