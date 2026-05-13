// Fringe intake — Booking page (step 8 of 9)
// Replaces: ConsultCalendarPage
// API: bookingApi.getAvailability() → { "YYYY-MM": ["10:30", "12:00", ...] }
//      bookingApi.createAppointment() → POST /api/appointments

import { useState } from "react";
import { color, font } from "../../fringe-ui/tokens";
import { IntakeShell } from "../IntakeShell/IntakeShell";
import { StylistCard } from "../../molecules/StylistCard/StylistCard";
import { DayCell } from "../../molecules/DayCell/DayCell";
import { Eyebrow } from "../../atoms/Eyebrow/Eyebrow";
import { useGetAvailabilityQuery } from "../../store/api/bookingApi";
import { useCreateAppointmentMutation } from "../../store/api/bookingApi";
import type { CreateAppointmentRequestDto } from "../../store/api/types";

const MONTH_DAYS = Array.from({ length: 35 }, (_, i) => i + 1);
const DOT_DAYS = [14, 17, 19, 23, 24, 26, 30];
const TIMES = ["10:30a", "12:00p", "2:00p", "4:30p"];

interface BookingPageProps {
  intakeId?: string;
  serviceId: string;
  stylist: { name: string; role: string; rate: string; available: string };
  onNext: () => void;
  onBack: () => void;
}

export function BookingPage({ intakeId, serviceId, stylist, onNext, onBack }: BookingPageProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>("18");
  const [selectedTime, setSelectedTime] = useState<string | null>("2:00p");
  const { data: availability } = useGetAvailabilityQuery(
    { month: "2026-06", serviceId },
    { skip: !serviceId }
  );
  const [createAppointment, { isLoading }] = useCreateAppointmentMutation();

  const handleSubmit = async () => {
    if (!selectedDay || !selectedTime) return;
    const payload: CreateAppointmentRequestDto = {
      service_id: serviceId,
      date: `2026-06-${selectedDay.padStart(2, "0")}`,
      start_time: selectedTime.replace("a", ":00").replace("p", ":00"),
      client_name: "Client",
    };
    try {
      await createAppointment(payload).unwrap();
    } catch {
      // non-blocking - still advance
    }
    onNext();
  };

  return (
    <IntakeShell
      step={8}
      total={9}
      eyebrow="Chapter VIII · The Date"
      title="When suits you?"
      onNext={handleSubmit}
      onBack={onBack}
      nextLabel={isLoading ? "Booking…" : "Hold this slot →"}
    >
      <StylistCard
        name={stylist.name}
        role={stylist.role}
        rate={stylist.rate}
        available={stylist.available}
      />

      <div data-component="BookingPage" style={{ height: 20 }} />

      {/* Calendar */}
      <Eyebrow style={{ marginBottom: 10 }}>JUNE 2025</Eyebrow>
      <div data-component="BookingPage" style={{
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: 4,
        marginBottom: 20,
      }}>
        {["M", "T", "W", "T", "F", "S", "S"].map((d) => (
          <div data-component="BookingPage" key={d} style={{
            fontFamily: font.mono,
            fontSize: 10,
            color: color.soft,
            textAlign: "center" as const,
            padding: 4,
          }}>
            {d}
          </div>
        ))}
        {[0, 1].map((i) => <div key={`gap-${i}`} />)}
        {MONTH_DAYS.map((d) => (
          <DayCell
            key={d}
            day={String(d)}
            selected={String(d) === selectedDay}
            disabled={d < 12}
            dot={DOT_DAYS.includes(d)}
            onClick={() => setSelectedDay(String(d))}
          />
        ))}
      </div>

      {/* Time slots */}
      {selectedDay && (
        <>
          <Eyebrow style={{ marginBottom: 10 }}>Tue, Jun {selectedDay} — available times</Eyebrow>
          <div data-component="BookingPage" style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 6,
          }}>
            {TIMES.map((t) => {
              const sel = t === selectedTime;
              return (
                <div data-component="BookingPage"
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  style={{
                    padding: "10px 6px",
                    textAlign: "center" as const,
                    fontFamily: font.block,
                    fontSize: 15,
                    textTransform: "uppercase" as const,
                    background: sel ? color.plum : "transparent",
                    color: sel ? color.paper : color.ink,
                    border: `1px solid ${sel ? color.plum : color.rule}`,
                    cursor: "pointer",
                  }}
                >
                  {t}
                </div>
              );
            })}
          </div>
        </>
      )}
    </IntakeShell>
  );
}

export default BookingPage;