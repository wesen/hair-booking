/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 115: Replaced scaffold diagnostics with marker, selection, month-action, readonly, and mobile stories.
 */
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { MonthCalendar } from "./MonthCalendar";

const markers = [
  { date: "2026-05-08", kind: "published", tone: "success" as const },
  { date: "2026-05-15", kind: "scheduled", tone: "warning" as const },
];
const legend = [{ kind: "published", label: "Published", tone: "success" as const }, { kind: "scheduled", label: "Scheduled", tone: "warning" as const }];
const selectAction = { type: "select", target: "calendar.select", label: "Select date", placement: "calendarCell" as const };

function Probe() { const [last, setLast] = useState("No calendar action yet."); return <div><MonthCalendar calendarId="availability" month="2026-05" selectedDate="2026-05-15" markers={markers} legend={legend} previousMonthAction={{ type: "navigate", target: "calendar.prev", label: "Previous", placement: "toolbar" }} nextMonthAction={{ type: "navigate", target: "calendar.next", label: "Next", placement: "toolbar" }} selectDateAction={selectAction} onMonthAction={(action, context) => setLast(`${action.target}:${context.direction}:${context.month}`)} onSelectDate={(action, context) => setLast(`${action.target}:${context.date}`)} /><output style={{ display: "block", marginTop: 12, padding: 10, border: "1px solid #dfd2bd" }}>{last}</output></div>; }

const meta = { title: "Admin DSL Widgets/Organisms/MonthCalendar", component: MonthCalendar } satisfies Meta<typeof MonthCalendar>;
export default meta;
type Story = StoryObj;

export const DefaultMonth: Story = { render: () => <MonthCalendar calendarId="availability" month="2026-05" selectDateAction={selectAction} /> };
export const WithPublishedMarkers: Story = { render: () => <MonthCalendar calendarId="availability" month="2026-05" markers={[markers[0]]} legend={[legend[0]]} selectDateAction={selectAction} /> };
export const WithScheduledMarkers: Story = { render: () => <MonthCalendar calendarId="availability" month="2026-05" markers={markers} legend={legend} selectDateAction={selectAction} /> };
export const SelectedDate: Story = { render: () => <Probe /> };
export const NoActionsReadonly: Story = { render: () => <MonthCalendar calendarId="availability" month="2026-05" selectedDate="2026-05-12" markers={markers} legend={legend} /> };
export const PreviousNextActions: Story = { render: () => <Probe /> };
export const MobileCalendar: Story = { parameters: { viewport: { defaultViewport: "mobile1" } }, render: () => <MonthCalendar calendarId="availability" month="2026-05" markers={markers} legend={legend} selectDateAction={selectAction} /> };
