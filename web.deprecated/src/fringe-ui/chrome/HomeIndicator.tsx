// iOS home indicator — the small pill at the bottom of the screen

export function HomeIndicator({ color = '#111111' }: { color?: string }) {
  return (
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
        background: color,
        opacity: 0.65,
      }} />
    </div>
  );
}