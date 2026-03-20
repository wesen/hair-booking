interface PortalTopBarProps {
  initials: string;
  onAvatarClick?: () => void;
}

export function PortalTopBar({ initials, onAvatarClick }: PortalTopBarProps) {
  return (
    <div data-part="portal-top-bar">
      <div data-part="welcome-logo">✦ LUXE ✦</div>
      <div data-part="portal-avatar" onClick={onAvatarClick} role="button" tabIndex={0}>
        {initials}
      </div>
    </div>
  );
}
