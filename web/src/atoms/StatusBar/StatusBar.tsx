// iOS status bar mockup
// Shows: time (9:41) + signal/wifi/battery bars

export function StatusBar({ color = '#111111' }: { color?: string }) {
  return (
    <div data-component="StatusBar" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '14px 24px 8px',
      fontSize: 13,
      fontWeight: 600,
      color,
      fontFamily: '-apple-system, system-ui, sans-serif',
    }}>
      <span>9:41</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {/* Signal bars */}
        <svg width="17" height="11" viewBox="0 0 17 11" fill={color}>
          <rect x="0" y="7" width="3" height="4" rx="0.5"/>
          <rect x="4.5" y="5" width="3" height="6" rx="0.5"/>
          <rect x="9" y="2.5" width="3" height="8.5" rx="0.5"/>
          <rect x="13.5" y="0" width="3" height="11" rx="0.5"/>
        </svg>
        {/* Wifi icon */}
        <svg width="16" height="11" viewBox="0 0 16 11" fill={color}>
          <rect x="0.5" y="0.5" width="13" height="10" rx="2"
            style={{ fill: 'none', stroke: color, strokeOpacity: 0.4 }}/>
          <rect x="2" y="2" width="10" height="7" rx="1"/>
        </svg>
      </div>
    </div>
  );
}