/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 111: Replaced scaffold diagnostics with populated/empty/mobile rows and row-action probe.
 */
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ComparisonTable } from "./ComparisonTable";
import type { ComparisonTableRow } from "./ComparisonTable.types";

const rows: ComparisonTableRow[] = [
  { id: "service-name", field: "Service name", current: "Gloss", draft: "Gloss + toner", scheduled: "Friday" },
  { id: "duration", field: "Duration", current: "45 min", draft: "60 min", scheduled: "Friday" },
];
const rowsWithActions: ComparisonTableRow[] = rows.map((row) => ({ ...row, actions: [{ type: "open", target: "change.open", label: "Review", placement: "row" }] }));

function Probe() {
  const [last, setLast] = useState("No comparison row action clicked yet.");
  return <div style={{ padding: 24, maxWidth: 960 }}><ComparisonTable tableId="service-diff" rows={rowsWithActions} onRowAction={(action, context) => setLast(`${action.target}:${context.tableId}:${context.row.id}`)} /><output style={{ display: "block", marginTop: 12, padding: 10, border: "1px solid #dfd2bd" }}>{last}</output></div>;
}

const meta = { title: "Admin DSL Widgets/Organisms/ComparisonTable", component: ComparisonTable } satisfies Meta<typeof ComparisonTable>;
export default meta;
type Story = StoryObj;

export const Default: Story = { args: { tableId: "service-diff", rows } };
export const WithRowActions: Story = { render: () => <Probe /> };
export const Empty: Story = { args: { tableId: "service-diff", rows: [], empty: <span>No draft changes to review.</span> } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: "mobile1" } }, args: { tableId: "service-diff", rows: rowsWithActions } };
