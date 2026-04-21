import type { ReactNode, CSSProperties } from 'react';
import { color } from '../../tokens';
import { StatusBar }     from '../chrome/StatusBar';
import { HomeIndicator } from '../chrome/HomeIndicator';
import { AppHeader }     from '../chrome/AppHeader';
import { Progress }      from '../primitives/Progress';
import { Button }        from '../primitives/Button';

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

// Mobile shell for the 9-step intake flow.
// Wraps: StatusBar · AppHeader · Progress · title area · scroll content · bottom CTA bar · HomeIndicator

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
      height: '100%',
      background: color.paper,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      ...style,
    }}>
      <StatusBar />

      <AppHeader step={step} total={total} onBack={onBack} />

      <div style={{ padding: '8px 22px 0' }}>
        <Progress value={(step / total) * 100} />
      </div>

      <div style={{ padding: '22px 22px 8px' }}>
        {eyebrow && (
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 10,
            letterSpacing: 1.8,
            textTransform: 'uppercase',
            fontWeight: 600,
            color: color.plum,
            marginBottom: 8,
          }}>
            {eyebrow}
          </div>
        )}
        <div style={{
          fontFamily: '"Anton", Impact, sans-serif',
          fontSize: 40,
          letterSpacing: -0.3,
          textTransform: 'uppercase',
          color: color.ink,
          lineHeight: 0.95,
        }}>
          {title}
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 22px 100px',
      }}>
        {children}
      </div>

      {/* Bottom CTA bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '12px 22px 22px',
        background: color.paper,
        borderTop: `1px solid ${color.rule}`,
        display: 'flex',
        gap: 10,
      }}>
        {onSkip && (
          <Button variant="secondary" size="md" onClick={onSkip}>
            Skip
          </Button>
        )}
        <Button
          variant="primary"
          size="lg"
          style={{ flex: 1 }}
          onClick={onNext}
        >
          {nextLabel}
        </Button>
      </div>

      <HomeIndicator />
    </div>
  );
}