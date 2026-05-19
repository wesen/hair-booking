/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 115: Replaced scaffold diagnostics with appointment/availability/time-off and callback-probe stories.
 */
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { CalendarEventBlock } from "./CalendarEventBlock";

function Probe() { const [last, setLast] = useState("No event action clicked yet."); return <div><CalendarEventBlock id="appt-1" kind="appointment" clientName="Maya Chen" service="Color consultation" startsAt="10a" endsAt="11a" action={{ type: "open", target: "calendar.open", label: "Open", placement: "calendarCell" }} onAction={(action, context) => setLast(`${action.target}:${context.blockId}`)} /><output style={{ display: "block", marginTop: 12, padding: 10, border: "1px solid #dfd2bd" }}>{last}</output></div>; }

const meta = { title: "Admin DSL Widgets/Molecules/CalendarEventBlock", component: CalendarEventBlock } satisfies Meta<typeof CalendarEventBlock>;
export default meta;
type Story = StoryObj;

export const Appointment: Story = { render: () => <CalendarEventBlock id="appt-1" kind="appointment" clientName="Maya Chen" service="Color consultation" startsAt="10a" endsAt="11a" /> };
export const Availability: Story = { render: () => <CalendarEventBlock id="avail-1" kind="availability" title="Available" status="Open booking window" startsAt="1p" endsAt="4p" /> };
export const TimeOff: Story = { render: () => <CalendarEventBlock id="off-1" kind="timeOff" title="Stylist time off" status="Blocked" startsAt="2p" endsAt="5p" /> };
export const CompactBlock: Story = { render: () => <CalendarEventBlock id="compact" kind="appointment" clientName="Jules" startsAt="9a" endsAt="9:30a" /> };
export const AgendaItem: Story = { render: () => <Probe /> };
