import { color } from '../../fringe-ui/tokens';
import { Wordmark } from '../../atoms/Wordmark/Wordmark';

interface AppHeaderProps {
  step?: number;
  total?: number;
  onBack?: () => void;
}

// Mobile top bar: back chevron · wordmark · step counter

export function AppHeader({ step, total, onBack }: AppHeaderProps) {
  return (
    <div data-component="AppHeader" style={{
      padding: '6px 22px 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <button data-component="AppHeader"
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
          <path d="M11 4L5 9l6 5"/>
        </svg>
      </button>

      <Wordmark size={14}/>

      {step != null && (
        <div data-component="AppHeader" style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 11,
          letterSpacing: 1.5,
          color: color.soft,
        }}>
          {String(step).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </div>
      )}
    </div>
  );
}