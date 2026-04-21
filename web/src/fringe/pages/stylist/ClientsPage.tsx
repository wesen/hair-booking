// Fringe stylist — Clients roster page
// Replaces: ClientsPage
// API: stylistApi.getClients() → StylistClientsResponseDto

import { useState } from "react";
import { color, font } from "../../../fringe-ui/tokens";
import { StylistShell } from "../../../fringe-ui/layout/StylistShell";
import { Eyebrow } from "../../../fringe-ui/primitives/Eyebrow";
import { Chip } from "../../../fringe-ui/primitives/Chip";
import { TextField } from "../../../fringe-ui/primitives/TextField";
import type { StylistClientListItemDto } from "../../../stylist/store/api/types";

interface ClientsPageProps {
  clients: StylistClientListItemDto[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  accentColor?: string;
  onSelectClient: (clientId: string) => void;
}

const FILTER_CHIPS = ["All", "Today", "This week", "VIPs", "Overdue", "New"];

function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: 999,
      background: color.peachSoft,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: font.block,
      fontSize: size * 0.4,
      color: color.plum,
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

export function ClientsPage({ clients, activeTab, onTabChange, accentColor = "#e8573c", onSelectClient }: ClientsPageProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = clients.filter((c) => {
    if (search) return c.name.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  const today = filtered.slice(0, 5);
  const dueSoon = filtered.slice(5);

  return (
    <StylistShell activeTab={activeTab} onTabChange={onTabChange} accentColor={accentColor}>
      {/* Header */}
      <div style={{ padding: "14px 22px 18px" }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}>
          <Eyebrow color={accentColor}>ROSTER · {clients.length} ACTIVE</Eyebrow>
          <div style={{
            width: 34,
            height: 34,
            border: `1px solid ${color.rule}`,
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: font.block,
            fontSize: 14,
            cursor: "pointer",
          }}>
            +
          </div>
        </div>
        <div style={{
          fontFamily: font.block,
          fontSize: 40,
          textTransform: "uppercase" as const,
          letterSpacing: -0.4,
          lineHeight: 0.95,
        }}>
          Your<br />clients.
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: "0 22px 14px" }}>
        <div style={{
          padding: "12px 14px",
          background: color.cream,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
          <div style={{ fontFamily: font.mono, fontSize: 11, color: color.soft }}>⌕</div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, service, notes…"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontFamily: font.serif,
              fontStyle: "italic",
              fontSize: 15,
              color: color.soft,
            }}
          />
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ padding: "0 22px 14px", display: "flex", gap: 6, overflowX: "auto" as const }}>
        {FILTER_CHIPS.map((f) => (
          <Chip key={f} selected={filter === f} onClick={() => setFilter(f)}>
            {f}
          </Chip>
        ))}
      </div>

      {/* Today group */}
      <div style={{ padding: "0 22px" }}>
        <Eyebrow color={accentColor} style={{ padding: "8px 0 6px" }}>
          TODAY · {today.length}
        </Eyebrow>
        {today.map((c) => (
          <ClientRow key={c.id} client={c} accentColor={accentColor} onSelect={onSelectClient} />
        ))}

        {dueSoon.length > 0 && (
          <>
            <Eyebrow style={{ padding: "18px 0 6px" }}>DUE SOON · {dueSoon.length}</Eyebrow>
            {dueSoon.map((c) => (
              <ClientRow key={c.id} client={c} accentColor={accentColor} onSelect={onSelectClient} />
            ))}
          </>
        )}
      </div>
    </StylistShell>
  );
}

function ClientRow({
  client,
  accentColor,
  onSelect,
}: {
  client: StylistClientListItemDto;
  accentColor: string;
  onSelect: (id: string) => void;
}) {
  const isNew = client.appointment_count <= 1;
  const isVip = false; // computed from loyalty tier if needed

  return (
    <div
      onClick={() => onSelect(client.id)}
      style={{
        padding: "12px 0",
        borderTop: `1px solid ${color.rule}`,
        display: "grid",
        gridTemplateColumns: "44px 1fr auto",
        gap: 12,
        alignItems: "center",
        cursor: "pointer",
      }}
    >
      <Avatar name={client.name} />
      <div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 2 }}>
          <div style={{ fontFamily: font.block, fontSize: 15 }}>{client.name}</div>
          {isNew && <span style={{ fontFamily: font.mono, fontSize: 9, letterSpacing: 1.2, textTransform: "uppercase" as const, padding: "2px 6px", background: color.butter, color: color.ink }}>NEW</span>}
        </div>
        <div style={{
          fontFamily: font.serif,
          fontStyle: "italic",
          fontSize: 14,
          color: color.softInk,
        }}>
          {client.service_summary ?? "—"} · {client.last_intake_id ? `L${client.last_intake_id.slice(-1)}` : "—"}
        </div>
        <div style={{ fontFamily: font.mono, fontSize: 10, color: color.soft, marginTop: 3 }}>
          {client.last_appointment_date?.toUpperCase() ?? "—"} · {client.appointment_count} VISITS
        </div>
      </div>
      <div style={{ fontFamily: font.block, fontSize: 16, color: accentColor }}>›</div>
    </div>
  );
}

export default ClientsPage;