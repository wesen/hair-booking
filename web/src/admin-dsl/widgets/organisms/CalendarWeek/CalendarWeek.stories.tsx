/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 115: Replaced scaffold diagnostics with week, mixed-event, empty, mobile agenda, and long-label stories.
 */
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { CalendarWeek } from "./CalendarWeek";
import type { CalendarEventBlockProps } from "../../molecules/CalendarEventBlock";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const hours = ["9a", "10a", "11a", "12p", "1p", "2p", "3p"];
const blocks: CalendarEventBlockProps[] = [
  { id: "appt-1", kind: "appointment", column: 1, row: 2, span: 1, clientName: "Maya Chen", service: "Color consultation", startsAt: "10a", endsAt: "11a", action: { type: "open", target: "calendar.open", label: "Open", placement: "calendarCell" } },
  { id: "off-1", kind: "timeOff", column: 3, row: 5, span: 2, title: "Stylist time off", status: "Blocked", startsAt: "1p", endsAt: "3p" },
];
function Probe() { const [last, setLast] = useState("No block action clicked yet."); return <div><CalendarWeek calendarId="week" days={days} hours={hours} blocks={blocks} onBlockAction={(action, context) => setLast(`${action.target}:${context.block.id}`)} /><output style={{ display: "block", marginTop: 12, padding: 10, border: "1px solid #dfd2bd" }}>{last}</output></div>; }
const meta = { title: "Admin DSL Widgets/Organisms/CalendarWeek", component: CalendarWeek } satisfies Meta<typeof CalendarWeek>;
export default meta;
type Story = StoryObj;

export const DefaultWeek: Story = { render: () => <Probe /> };
export const AppointmentsAndTimeOff: Story = { render: () => <CalendarWeek calendarId="week" days={days} hours={hours} blocks={blocks} /> };
export const NoAppointments: Story = { render: () => <CalendarWeek calendarId="week" days={days} hours={hours} blocks={[]} /> };
export const MobileAgenda: Story = { parameters: { viewport: { defaultViewport: "mobile1" } }, render: () => <CalendarWeek calendarId="week" days={days} hours={hours} blocks={blocks} /> };
export const LongDayLabels: Story = { render: () => <CalendarWeek calendarId="week" days={["Monday May 4", "Tuesday May 5", "Wednesday May 6"]} hours={hours.slice(0, 4)} blocks={blocks.slice(0, 1)} /> };
