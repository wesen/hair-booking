import { useEffect, useMemo, useState } from "react";
import { useAppDispatch } from "../store";
import { goBackFromProfile } from "../store/portalSlice";
import { goToScreen } from "../store/consultationSlice";
import { getApiErrorMessage, usePortalProfileView, useSessionBootstrap, useUpdateMeMutation, useUpdateNotificationPrefsMutation } from "../store/api";
import { NotificationPrefs } from "../components/NotificationPrefs";
import { Icon } from "../components/Icon";
import { buildAuthPath, buildRuntimeURL } from "../utils/authNavigation";

interface ProfileFormState {
  name: string;
  email: string;
  phone: string;
  scalpNotes: string;
}

function buildProfileFormState(values: {
  name?: string;
  email?: string;
  phone?: string;
  scalpNotes?: string;
}): ProfileFormState {
  return {
    name: values.name ?? "",
    email: values.email ?? "",
    phone: values.phone ?? "",
    scalpNotes: values.scalpNotes ?? "",
  };
}

interface PortalProfilePageProps {
  showPaymentMethodsAction?: boolean;
}

export function PortalProfilePage({ showPaymentMethodsAction = true }: PortalProfilePageProps) {
  const dispatch = useAppDispatch();
  const session = useSessionBootstrap();
  const { client, user, notificationPrefs, isLoading, errorMessage } = usePortalProfileView();
  const [updateMe, updateMeState] = useUpdateMeMutation();
  const [updateNotificationPrefs, updateNotificationPrefsState] = useUpdateNotificationPrefsMutation();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileFormState>(() => buildProfileFormState({}));
  const [profileSubmitError, setProfileSubmitError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setProfileForm(buildProfileFormState({
      name: client?.name,
      email: client?.email,
      phone: client?.phone,
      scalpNotes: client?.scalp_notes,
    }));
  }, [client?.email, client?.name, client?.phone, client?.scalp_notes]);

  const normalizedCurrent = useMemo(() => ({
    name: client?.name?.trim() ?? "",
    email: client?.email?.trim().toLowerCase() ?? "",
    phone: client?.phone?.trim() ?? "",
    scalpNotes: client?.scalp_notes?.trim() ?? "",
  }), [client?.email, client?.name, client?.phone, client?.scalp_notes]);

  const normalizedDraft = useMemo(() => ({
    name: profileForm.name.trim(),
    email: profileForm.email.trim().toLowerCase(),
    phone: profileForm.phone.trim(),
    scalpNotes: profileForm.scalpNotes.trim(),
  }), [profileForm.email, profileForm.name, profileForm.phone, profileForm.scalpNotes]);

  const profileIsDirty = normalizedDraft.name !== normalizedCurrent.name
    || normalizedDraft.email !== normalizedCurrent.email
    || normalizedDraft.phone !== normalizedCurrent.phone
    || normalizedDraft.scalpNotes !== normalizedCurrent.scalpNotes;

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

      {isEditingProfile ? (
        <div data-part="profile-section">
          <div data-part="profile-section-title">EDIT PROFILE</div>
          <div data-part="form-group">
            <label data-part="form-label">Name</label>
            <input
              data-part="text-input"
              placeholder="First & last name"
              value={profileForm.name}
              onChange={event => setProfileForm(current => ({ ...current, name: event.target.value }))}
            />
          </div>
          <div data-part="form-group">
            <label data-part="form-label">Email</label>
            <input
              data-part="text-input"
              type="email"
              placeholder="your@email.com"
              value={profileForm.email}
              onChange={event => setProfileForm(current => ({ ...current, email: event.target.value }))}
            />
          </div>
          <div data-part="form-group">
            <label data-part="form-label">Phone</label>
            <input
              data-part="text-input"
              type="tel"
              placeholder="(401) 555-0123"
              value={profileForm.phone}
              onChange={event => setProfileForm(current => ({ ...current, phone: event.target.value }))}
            />
          </div>
          <div data-part="form-group">
            <label data-part="form-label">Scalp / care notes</label>
            <textarea
              data-part="text-input"
              rows={4}
              placeholder="Sensitive scalp, maintenance preferences, or other important notes"
              value={profileForm.scalpNotes}
              onChange={event => setProfileForm(current => ({ ...current, scalpNotes: event.target.value }))}
            />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button
              data-part="btn-accent"
              disabled={updateMeState.isLoading || !profileIsDirty}
              onClick={async () => {
                if (!profileIsDirty) {
                  setIsEditingProfile(false);
                  return;
                }

                setProfileSubmitError(null);
                try {
                  await updateMe({
                    ...(normalizedDraft.name !== normalizedCurrent.name ? { name: profileForm.name } : {}),
                    ...(normalizedDraft.email !== normalizedCurrent.email ? { email: profileForm.email } : {}),
                    ...(normalizedDraft.phone !== normalizedCurrent.phone ? { phone: profileForm.phone } : {}),
                    ...(normalizedDraft.scalpNotes !== normalizedCurrent.scalpNotes ? { scalp_notes: profileForm.scalpNotes } : {}),
                  }).unwrap();
                  setIsEditingProfile(false);
                } catch (error) {
                  setProfileSubmitError(getApiErrorMessage(error, "We could not update your profile yet."));
                }
              }}
            >
              {updateMeState.isLoading ? "Saving..." : "Save Profile"}
            </button>
            <button
              data-part="profile-action-item"
              style={{ marginTop: 0, flex: "0 0 auto" }}
              disabled={updateMeState.isLoading}
              onClick={() => {
                setProfileSubmitError(null);
                setProfileForm(buildProfileFormState({
                  name: client?.name,
                  email: client?.email,
                  phone: client?.phone,
                  scalpNotes: client?.scalp_notes,
                }));
                setIsEditingProfile(false);
              }}
            >
              Cancel
            </button>
          </div>
          {profileSubmitError ? (
            <div style={{ fontSize: 13, color: "var(--color-danger)", marginTop: 10 }}>
              {profileSubmitError}
            </div>
          ) : null}
        </div>
      ) : null}

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
          <button
            data-part="profile-action-item"
            onClick={() => {
              setProfileSubmitError(null);
              setIsEditingProfile(true);
            }}
          >
            Edit Profile
          </button>
          {showPaymentMethodsAction ? <button data-part="profile-action-item">Payment Methods</button> : null}
          <button
            data-part="profile-action-item"
            data-danger
            onClick={() => window.location.assign(buildAuthPath(session.logoutPath, buildRuntimeURL("/")))}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
