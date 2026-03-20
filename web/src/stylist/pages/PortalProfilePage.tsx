import { useState } from "react";
import { useAppDispatch } from "../store";
import { goBackFromProfile } from "../store/portalSlice";
import { goToScreen } from "../store/consultationSlice";
import { getApiErrorMessage, usePortalProfileView, useSessionBootstrap, useUpdateNotificationPrefsMutation } from "../store/api";
import { NotificationPrefs } from "../components/NotificationPrefs";
import { Icon } from "../components/Icon";

export function PortalProfilePage() {
  const dispatch = useAppDispatch();
  const session = useSessionBootstrap();
  const { user, notificationPrefs, isLoading, errorMessage } = usePortalProfileView();
  const [updateNotificationPrefs, updateNotificationPrefsState] = useUpdateNotificationPrefsMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div data-part="page-content">
        <div data-part="section-heading" style={{ marginBottom: 8 }}>Profile</div>
        <div style={{ fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.7 }}>
          Loading your profile...
        </div>
      </div>
    );
  }

  if (errorMessage || !user) {
    return (
      <div data-part="page-content">
        <div data-part="section-heading" style={{ marginBottom: 8 }}>Profile</div>
        <div style={{ fontSize: 14, color: "var(--color-danger)", lineHeight: 1.7 }}>
          {errorMessage ?? "We could not load your profile yet."}
        </div>
      </div>
    );
  }

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
          prefs={notificationPrefs}
          onToggle={async key => {
            const selected = notificationPrefs.find(pref => pref.key === key);
            if (!selected || key === "marketing" || updateNotificationPrefsState.isLoading) {
              return;
            }

            setSubmitError(null);
            try {
              await updateNotificationPrefs({
                ...(key === "remind48hr" ? { remind_48hr: !selected.on } : {}),
                ...(key === "remind2hr" ? { remind_2hr: !selected.on } : {}),
                ...(key === "maintAlerts" ? { maint_alerts: !selected.on } : {}),
              }).unwrap();
            } catch (error) {
              setSubmitError(getApiErrorMessage(error, "We could not update your notification preferences."));
            }
          }}
        />
        {submitError ? (
          <div style={{ fontSize: 13, color: "var(--color-danger)", marginTop: 10 }}>
            {submitError}
          </div>
        ) : null}
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
