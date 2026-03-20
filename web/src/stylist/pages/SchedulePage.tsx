import { useAppSelector, useAppDispatch } from "../store";
import { setTab } from "../store/uiSlice";
import { setStep } from "../store/bookingSlice";
import { TopBar } from "../components/TopBar";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { StatusBadge } from "../components/StatusBadge";

export function SchedulePage() {
  const dispatch = useAppDispatch();
  const appointments = useAppSelector((state) => state.appointments.appointments);

  return (
    <div data-part="page-content">
      <TopBar
        title="Schedule"
        right={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              dispatch(setTab("book"));
              dispatch(setStep(1));
            }}
          >
            <Icon name="plus" size={14} /> Add
          </Button>
        }
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {appointments.map((appt) => (
          <Card key={appt.id}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{appt.client}</div>
                <StatusBadge status={appt.status} />
              </div>
              <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{appt.service}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <span
                  style={{
                    background: "var(--color-accent-light)",
                    color: "var(--color-accent-dark)",
                    padding: "2px 10px",
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {appt.date}
                </span>
                <span
                  style={{
                    background: "var(--color-gold-light)",
                    color: "var(--color-gold)",
                    padding: "2px 10px",
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {appt.time}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
