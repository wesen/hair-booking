import type { Client } from "../types";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Input } from "./Input";

interface ReferralModalProps {
  clients: Client[];
  referralFrom: string;
  referralTo: string;
  onReferralFromChange: (value: string) => void;
  onReferralToChange: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export function ReferralModal({
  clients,
  referralFrom,
  referralTo,
  onReferralFromChange,
  onReferralToChange,
  onSubmit,
  onClose,
}: ReferralModalProps) {
  return (
    <Modal onClose={onClose}>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 22,
              fontWeight: 700,
              marginBottom: 4,
            }}
          >
            Log a Referral
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
            Record when an existing client refers someone new.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 13, fontWeight: 600 }}>Who referred?</label>
          <select
            data-part="input"
            style={{ appearance: "auto" }}
            value={referralFrom}
            onChange={e => onReferralFromChange(e.target.value)}
          >
            <option value="">Select a client...</option>
            {clients.map(c => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 13, fontWeight: 600 }}>New client name</label>
          <Input
            placeholder="Enter new client name..."
            value={referralTo}
            onChange={e => onReferralToChange(e.target.value)}
          />
        </div>

        <Button onClick={onSubmit}>Log Referral</Button>
      </div>
    </Modal>
  );
}
