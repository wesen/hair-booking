import type { ReactNode, CSSProperties } from 'react';
import { color, font, type as typeToken } from '../../fringe-ui/tokens';

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

/**
 * Content shell for the 9-step intake flow.
 *
 * Renders (top to bottom):
 *   StatusBar (iOS time + icons)
 *   AppHeader (back · wordmark · step counter)
 *   Progress bar
 *   Eyebrow + title section
 *   Scrollable children content
 *   Bottom CTA bar (Skip + Keep going)
 */
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
    <div data-component="IntakeShell" style={{
      height: '100%',
      background: color.paper,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      ...style,
    }}>
      {/* ── Status Bar ──────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 24px 8px',
        fontSize: 13,
        fontWeight: 600,
        color: color.ink,
        fontFamily: '-apple-system, system-ui, sans-serif',
      }}>
        <span>9:41</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <svg width="17" height="11" viewBox="0 0 17 11" fill={color.ink}>
            <rect x="0" y="7" width="3" height="4" rx="0.5" />
            <rect x="4.5" y="5" width="3" height="6" rx="0.5" />
            <rect x="9" y="2.5" width="3" height="8.5" rx="0.5" />
            <rect x="13.5" y="0" width="3" height="11" rx="0.5" />
          </svg>
          <svg width="16" height="11" viewBox="0 0 16 11" fill={color.ink}>
            <rect x="0.5" y="0.5" width="13" height="10" rx="2"
              style={{ fill: 'none', stroke: color.ink, strokeOpacity: 0.4 }} />
            <rect x="2" y="2" width="10" height="7" rx="1" />
          </svg>
        </div>
      </div>

      {/* ── App Header: back · wordmark · step counter ─────── */}
      <div style={{
        padding: '6px 22px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"
            stroke={color.ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4L5 9l6 5" />
          </svg>
        </button>

        <div style={{
          fontFamily: font.block,
          fontSize: 14,
          letterSpacing: 3.5,
          textTransform: 'uppercase',
          userSelect: 'none',
        }}>
          Fringe
        </div>

        <div style={{
          fontFamily: font.mono,
          fontSize: 11,
          letterSpacing: 1.5,
          color: color.soft,
        }}>
          {String(step).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </div>
      </div>

      {/* ── Progress bar ────────────────────────────────────── */}
      <div style={{ height: 3, background: color.rule, width: '100%', marginTop: 8 }}>
        <div style={{ height: 3, background: color.plum, width: `${(step / total) * 100}%` }} />
      </div>

      {/* ── Eyebrow + Title section ─────────────────────────── */}
      <div style={{ padding: '20px 22px 0' }}>
        {eyebrow && (
          <div style={{
            ...typeToken.eyebrow,
            color: color.plum,
            marginBottom: 8,
          }}>
            {eyebrow}
          </div>
        )}
        <div style={{
          fontFamily: font.block,
          fontSize: 36,
          lineHeight: 1,
          letterSpacing: 0.3,
          textTransform: 'uppercase',
          color: color.ink,
        }}>
          {title}
        </div>
      </div>

      {/* ── Scrollable page content ─────────────────────────── */}
      <div data-component="IntakeShell" data-part="content" style={{ flex: 1, padding: '18px 22px 0' }}>
        {children}
      </div>

      {/* ── Bottom CTA bar ──────────────────────────────────── */}
      {onNext && (
        <div style={{
          padding: '16px 22px 28px',
          borderTop: `1px solid ${color.rule}`,
          display: 'flex',
          gap: 10,
          background: color.paper,
        }}>
          <button
            onClick={onSkip}
            style={{
              fontFamily: font.block,
              fontSize: 14,
              letterSpacing: 1,
              textTransform: 'uppercase',
              width: 75,
              padding: '12px 0',
              border: `1px solid ${color.ink}`,
              background: 'transparent',
              color: color.ink,
              cursor: onSkip ? 'pointer' : 'default',
              borderRadius: 0,
            }}
          >
            Skip
          </button>
          <button
            onClick={onNext}
            style={{
              fontFamily: font.block,
              fontSize: 14,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              padding: '14px 20px',
              border: 'none',
              background: color.plum,
              color: color.paper,
              cursor: 'pointer',
              flex: 1,
              borderRadius: 0,
            }}
          >
            {nextLabel}
          </button>
        </div>
      )}

      {/* ── Home indicator ──────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        bottom: 6,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 50,
      }}>
        <div style={{
          width: 120,
          height: 4,
          borderRadius: 2,
          background: color.ink,
          opacity: 0.65,
        }} />
      </div>
    </div>
  );
}
