// Fringe intake — Confirm page (step 9 of 9)
// Replaces: ConsultConfirmPage
// API: bookingApi.getAppointment() — read confirmation details

import { color, font } from "../../fringe-ui/tokens";
import { IntakeShell } from "../IntakeShell/IntakeShell";
import { Masthead } from "../../molecules/Masthead/Masthead";
import { SummaryRow } from "../../molecules/SummaryRow/SummaryRow";
import { Note } from "../../atoms/Note/Note";
import { Button } from "../../atoms/Button/Button";

interface ConfirmPageProps {
  confirmationNumber: string;
  when: string;
  time: string;
  stylist: string;
  service: string;
  estimate: string;
  duration: string;
  deposit: string;
  onDone: () => void;
  onAddToCalendar?: () => void;
}

export function ConfirmPage({
  confirmationNumber,
  when,
  time,
  stylist,
  service,
  estimate,
  duration,
  deposit,
  onDone,
  onAddToCalendar,
}: ConfirmPageProps) {
  return (
    <IntakeShell
      step={9}
      total={9}
      eyebrow="You're booked."
      title="See you"
      nextLabel="Done"
      onNext={onDone}
      onSkip={undefined}
    >
      <div data-component="ConfirmPage" data-page="ConfirmPage" style={{
        fontFamily: font.serif,
        fontStyle: "italic",
        fontSize: 17,
        color: color.softInk,
        marginBottom: 20,
      }}>
        A confirmation and prep notes are on their way.
      </div>

      <SummaryRow label="When"     value={`${when} · ${time}`} />
      <SummaryRow label="With"     value={stylist} />
      <SummaryRow label="Service"  value={service} />
      <SummaryRow label="Estimate" value={`${estimate} · ${duration}`} />
      <SummaryRow label="Deposit"  value={deposit} />

      <div data-component="ConfirmPage" data-page="ConfirmPage" style={{ marginTop: 20 }}>
        <Note tone="success">
          Deposit received. Cancellations inside 24h forfeit deposit.
        </Note>
      </div>

      {onAddToCalendar && (
        <div data-component="ConfirmPage" data-page="ConfirmPage" style={{ marginTop: 20 }}>
          <Button variant="secondary" onClick={onAddToCalendar}>
            Add to calendar
          </Button>
        </div>
      )}
    </IntakeShell>
  );
}

export default ConfirmPage;