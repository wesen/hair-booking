import { useAppSelector, useAppDispatch } from "../store";
import { goToScreen } from "../store/consultationSlice";
import { ConfirmCard } from "../components/ConfirmCard";
import { Icon } from "../components/Icon";
import { EXT_TYPES, COLOR_SERVICES } from "../data/consultation-constants";
import type { IconName } from "../types";

export function ConsultConfirmPage() {
  const dispatch = useAppDispatch();
  const data = useAppSelector(s => s.consultation.data);

  const dateObj = data.selectedDate ? new Date(data.selectedDate + "T12:00:00") : null;
  const dateStr = dateObj ? dateObj.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "";
  const extName = EXT_TYPES.find(t => t.id === data.extType)?.name;
  const colorName = COLOR_SERVICES.find(s => s.id === data.colorService)?.name;

  let svcLabel = "";
  if (data.serviceType === "extensions") svcLabel = `${extName || "Extension"} Consult`;
  else if (data.serviceType === "color") svcLabel = `${colorName || "Color"} Consult`;
  else svcLabel = "Color + Extension Consult";

  const details: { icon: IconName; text: string }[] = [
    { icon: "sparkle", text: svcLabel },
    { icon: "calendar", text: `${dateStr} @ ${data.selectedTime}` },
    { icon: "pin", text: "247 Wickenden St, Providence, RI" },
  ];
  if (data.depositPaid) {
    details.push({ icon: "dollar", text: "Deposit paid: $75" });
  }
  if (data.appointmentId) {
    details.push({ icon: "info", text: `Appointment ref: ${data.appointmentId.slice(0, 8)}` });
  }
  if (data.intakeId) {
    details.push({ icon: "book", text: `Intake ref: ${data.intakeId.slice(0, 8)}` });
  }

  return (
    <div data-part="page-content">
      <ConfirmCard
        details={details}
        subtitle={data.appointmentId ? `Confirmation saved with reference ${data.appointmentId.slice(0, 8)}` : "Confirmation sent to your email"}
      />

      <div data-part="expect-card">
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: "var(--color-text)" }}>What to Expect</div>
        <div data-part="expect-item">
          <span data-part="expect-emoji">📋</span>
          <span>We'll assess your hair in person and finalize your quote</span>
        </div>
        <div data-part="expect-item">
          <span data-part="expect-emoji">⏱️</span>
          <span>Consult: 15 min · Install appointment: 2–4 hours</span>
        </div>
        {data.depositPaid && (
          <div data-part="expect-item">
            <span data-part="expect-emoji">💰</span>
            <span>Your deposit applies to your first service</span>
          </div>
        )}
        <div data-part="expect-item">
          <span data-part="expect-emoji">💬</span>
          <span>We'll text you a reminder 48 hours before</span>
        </div>
      </div>

      <div data-part="action-links">
        <button data-part="action-link" onClick={() => {
          const start = data.selectedDate && data.selectedTime
            ? (() => {
                const [timePart, ampm] = (data.selectedTime || "").split(" ");
                const [hStr, mStr] = timePart.split(":");
                let h = parseInt(hStr, 10);
                if (ampm === "PM" && h !== 12) h += 12;
                if (ampm === "AM" && h === 12) h = 0;
                const m = parseInt(mStr, 10);
                const d = new Date(data.selectedDate + "T12:00:00");
                d.setHours(h, m, 0, 0);
                return d;
              })()
            : null;
          if (start) {
            const end = new Date(start.getTime() + 15 * 60 * 1000);
            const fmt = (d: Date) =>
              d.getFullYear().toString() +
              String(d.getMonth() + 1).padStart(2, "0") +
              String(d.getDate()).padStart(2, "0") +
              "T" +
              String(d.getHours()).padStart(2, "0") +
              String(d.getMinutes()).padStart(2, "0") +
              String(d.getSeconds()).padStart(2, "0");
            const url = `https://calendar.google.com/calendar/r/eventnew?text=${encodeURIComponent(svcLabel)}&dates=${fmt(start)}/${fmt(end)}&location=${encodeURIComponent("247 Wickenden St, Providence, RI")}`;
            window.open(url, "_blank");
          }
        }}>
          <Icon name="calendar" size={16} /> Add to Calendar
        </button>
        <button data-part="action-link" onClick={() => {
          window.open("https://www.google.com/maps/dir/?api=1&destination=247+Wickenden+St+Providence+RI", "_blank");
        }}>
          <Icon name="map" size={16} /> Get Directions
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        <button data-part="btn-secondary" onClick={() => dispatch(goToScreen("care-guide"))}>
          <Icon name="book" size={16} /> Read: Extension Care 101
        </button>
      </div>
    </div>
  );
}
