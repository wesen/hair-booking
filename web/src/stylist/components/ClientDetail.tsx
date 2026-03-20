import type { Client } from "../types";
import { Icon } from "./Icon";
import { TierBadge } from "./TierBadge";
import { Card } from "./Card";
import { ProgressBar } from "./ProgressBar";
import { SectionTitle } from "./SectionTitle";
import { QuickAction } from "./QuickAction";
import { getTier, getTierProgress } from "../utils/loyalty";
import { getAvatarColor, getInitials } from "../utils/avatar";

interface ClientDetailProps {
  client: Client;
  onBack: () => void;
  onBookAppointment: () => void;
  onLogVisit: () => void;
  onAddReferral: () => void;
  onMessage: () => void;
}

export function ClientDetail({
  client,
  onBack,
  onBookAppointment,
  onLogVisit,
  onAddReferral,
  onMessage,
}: ClientDetailProps) {
  const tier = getTier(client.points);
  const progress = getTierProgress(client.points);

  return (
    <div data-part="client-detail">
      {/* Back button */}
      <button
        data-part="back-button"
        onClick={onBack}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "8px 0",
          fontSize: 14,
          color: "var(--color-text-muted)",
        }}
      >
        <Icon name="back" size={16} />
        Back
      </button>

      {/* Detail header */}
      <div data-part="detail-header" style={{ textAlign: "center", padding: "16px 0" }}>
        <div
          data-part="client-avatar"
          style={{
            background: getAvatarColor(client.name),
            width: 72,
            height: 72,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            fontWeight: 700,
            color: "#fff",
            margin: "0 auto 12px",
          }}
        >
          {getInitials(client.name)}
        </div>
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 6,
          }}
        >
          {client.name}
        </h2>
        <div style={{ marginBottom: 6 }}>
          <TierBadge tier={tier} /> <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Member</span>
        </div>
        {client.phone && (
          <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
            {client.phone}
          </div>
        )}
      </div>

      {/* Detail stats row */}
      <div
        data-part="detail-stats"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <div data-part="detail-stat" style={{ textAlign: "center" }}>
          <div data-part="detail-stat-num" style={{ fontSize: 20, fontWeight: 700 }}>
            {client.visits}
          </div>
          <div data-part="detail-stat-label" style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            Visits
          </div>
        </div>
        <div data-part="detail-stat" style={{ textAlign: "center" }}>
          <div data-part="detail-stat-num" style={{ fontSize: 20, fontWeight: 700 }}>
            {client.points}
          </div>
          <div data-part="detail-stat-label" style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            Points
          </div>
        </div>
        <div data-part="detail-stat" style={{ textAlign: "center" }}>
          <div data-part="detail-stat-num" style={{ fontSize: 20, fontWeight: 700 }}>
            {client.referrals}
          </div>
          <div data-part="detail-stat-label" style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            Referrals
          </div>
        </div>
      </div>

      {/* Loyalty progress card */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ padding: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 600 }}>Loyalty Progress</span>
            <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
              {tier.next
                ? `${tier.needed} pts to ${tier.next}`
                : "Max tier reached! \uD83C\uDF89"}
            </span>
          </div>
          <ProgressBar
            progress={progress}
            color={tier.color}
            gradientTo={tier.next ? undefined : tier.color}
          />
        </div>
      </Card>

      {/* Upcoming card */}
      {client.upcoming && (
        <Card variant="gold" style={{ marginBottom: 16 }}>
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
              Upcoming Appointment
            </div>
            <div style={{ fontSize: 14 }}>{client.upcoming}</div>
          </div>
        </Card>
      )}

      {/* Notes section */}
      {client.notes && (
        <div style={{ marginBottom: 16 }}>
          <SectionTitle icon="note">Notes</SectionTitle>
          <div data-part="note-box" style={{ padding: "12px 0", fontSize: 14, color: "var(--color-text-muted)" }}>
            {client.notes}
          </div>
        </div>
      )}

      {/* Quick actions grid */}
      <div data-part="quick-actions" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <QuickAction icon="calendar" label="Book Appt" onClick={onBookAppointment} />
        <QuickAction icon="check" label="Log Visit" onClick={onLogVisit} />
        <QuickAction icon="gift" label="Add Referral" onClick={onAddReferral} />
        <QuickAction icon="send" label="Message" onClick={onMessage} />
      </div>
    </div>
  );
}
