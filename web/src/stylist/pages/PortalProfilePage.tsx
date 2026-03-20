import { useAppSelector, useAppDispatch } from "../store";
import { goBackFromProfile, toggleNotificationPref } from "../store/portalSlice";
import { goToScreen } from "../store/consultationSlice";
import { useSessionBootstrap } from "../store/api";
import { NotificationPrefs } from "../components/NotificationPrefs";
import { Icon } from "../components/Icon";

export function PortalProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.portal.user);
  const notifPrefs = useAppSelector(s => s.portal.notificationPrefs);
  const session = useSessionBootstrap();

  return (
    <div data-part="page-content">
      <button
        onClick={() => dispatch(goBackFromProfile())}
        style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 6, color: "var(--color-accent-dark)", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 500, marginBottom: 8 }}
      >
        <Icon name="back" size={18} /> Back
      </button>

      <div data-part="profile-header">
        <div data-part="profile-avatar">{user.initials}</div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 500 }}>{user.name}</div>
        <div data-part="profile-meta">
          {user.email}<br />
          {user.phone}<br />
          Client since {user.since}
        </div>
      </div>

      <div data-part="profile-section">
        <div data-part="profile-section-title">MY SERVICES</div>
        <div style={{ fontSize: 14, color: "var(--color-text-secondary)", whiteSpace: "pre-line", lineHeight: 1.6 }}>
          {user.serviceDescription}
        </div>
      </div>

      <div data-part="profile-section">
        <div data-part="profile-section-title">PREFERENCES</div>
        <NotificationPrefs
          prefs={notifPrefs}
          onToggle={key => dispatch(toggleNotificationPref(key))}
        />
      </div>

      <div data-part="profile-section">
        <div data-part="profile-section-title">CARE GUIDES</div>
        <div data-part="profile-action-list">
          <button data-part="profile-action-item" onClick={() => dispatch(goToScreen("care-guide"))}>
            {"\u{1F4D6}"} Extension Care 101
          </button>
          <button data-part="profile-action-item">
            {"\u{1F4D6}"} Color Aftercare
          </button>
        </div>
      </div>

      <div data-part="profile-section">
        <div data-part="profile-action-list">
          <button data-part="profile-action-item">Edit Profile</button>
          <button data-part="profile-action-item">Payment Methods</button>
          <button
            data-part="profile-action-item"
            data-danger
            onClick={() => window.location.assign(session.logoutPath)}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
