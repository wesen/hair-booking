import { Modal } from "./Modal";
import { Icon } from "./Icon";

interface DepositPaymentSheetProps {
  amount: number;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  cardZip: string;
  onCardNumberChange: (v: string) => void;
  onCardExpiryChange: (v: string) => void;
  onCardCvcChange: (v: string) => void;
  onCardZipChange: (v: string) => void;
  onPay: () => void;
  onClose: () => void;
  processing?: boolean;
  error?: string | null;
}

export function DepositPaymentSheet({
  amount,
  cardNumber,
  cardExpiry,
  cardCvc,
  cardZip,
  onCardNumberChange,
  onCardExpiryChange,
  onCardCvcChange,
  onCardZipChange,
  onPay,
  onClose,
  processing,
  error,
}: DepositPaymentSheetProps) {
  const canPay = cardNumber.length >= 4 && cardExpiry && cardCvc && cardZip;

  return (
    <Modal onClose={onClose}>
      <div data-part="payment-sheet">
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 400, marginBottom: 4 }}>
          Pay ${amount} Deposit
        </div>
        <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 20, lineHeight: 1.5 }}>
          Applies to your first service. Non-refundable within 24 hrs of appt.
        </div>

        <div data-part="form-group">
          <label data-part="form-label">Card number</label>
          <input
            data-part="text-input"
            placeholder="4242 ···· ···· ····"
            value={cardNumber}
            onChange={e => onCardNumberChange(e.target.value)}
            inputMode="numeric"
          />
        </div>

        <div data-part="payment-row">
          <div data-part="form-group">
            <label data-part="form-label">MM / YY</label>
            <input
              data-part="text-input"
              placeholder="MM / YY"
              value={cardExpiry}
              onChange={e => onCardExpiryChange(e.target.value)}
              inputMode="numeric"
            />
          </div>
          <div data-part="form-group">
            <label data-part="form-label">CVC</label>
            <input
              data-part="text-input"
              placeholder="CVC"
              value={cardCvc}
              onChange={e => onCardCvcChange(e.target.value)}
              inputMode="numeric"
              maxLength={4}
            />
          </div>
        </div>

        <div data-part="form-group">
          <label data-part="form-label">ZIP</label>
          <input
            data-part="text-input"
            placeholder="02903"
            value={cardZip}
            onChange={e => onCardZipChange(e.target.value)}
            inputMode="numeric"
            maxLength={10}
          />
        </div>

        {error && (
          <div style={{ color: "var(--color-danger)", fontSize: 13, marginBottom: 12, textAlign: "center" }}>
            {error}
          </div>
        )}

        <button
          data-part="btn-accent"
          onClick={onPay}
          disabled={!canPay || processing}
        >
          {processing ? "Processing..." : `Pay $${amount}`}
        </button>

        <div data-part="security-badge">
          <Icon name="lock" size={14} /> Secured by Stripe
        </div>
      </div>
    </Modal>
  );
}
