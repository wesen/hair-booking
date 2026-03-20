import { Icon } from "./Icon";

interface ReferralCardProps {
  code: string;
  discount: string;
  referralCount: number;
  onCopyLink?: () => void;
  onTextIt?: () => void;
}

export function ReferralCard({ code, discount, referralCount, onCopyLink, onTextIt }: ReferralCardProps) {
  return (
    <div data-part="referral-card">
      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Refer a Friend</div>
      <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{discount}</div>

      <div data-part="referral-code">{code}</div>

      <div data-part="referral-actions">
        <button data-part="action-link" onClick={onCopyLink}>
          <Icon name="send" size={14} /> Copy Link
        </button>
        <button data-part="action-link" onClick={onTextIt}>
          <Icon name="phone" size={14} /> Text It
        </button>
      </div>

      <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 12, textAlign: "center" }}>
        {referralCount} friends referred ✓
      </div>
    </div>
  );
}
