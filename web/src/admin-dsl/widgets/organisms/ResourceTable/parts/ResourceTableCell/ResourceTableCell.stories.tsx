/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 105: Added story changelog, richer status/boolean fixtures, and visible row-action callback probe.
 */
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ResourceTableCell } from "./ResourceTableCell";
import type { ActionViewModel } from "../../../../shared";

const openAction: ActionViewModel = { type: "open", target: "requests.open", label: "Open", placement: "row" };

function Frame({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: 24, maxWidth: 520 }}>{children}</div>;
}

function ActionProbe() {
  const [last, setLast] = useState("No row action clicked yet.");
  const row = { id: "req_1", customer: "Maya Chen", actions: [openAction] };
  return (
    <Frame>
      <ResourceTableCell tableId="requests" column={{ id: "actions", kind: "actions" }} row={row} onRowAction={(action, context) => setLast(`${action.target}:row=${context.rowId}:table=${context.tableId}`)} />
      <output style={{ display: "block", marginTop: 12, padding: 10, border: "1px solid #dfd2bd" }}>{last}</output>
    </Frame>
  );
}

const meta = { title: "Admin DSL Widgets/Organisms/ResourceTable/ResourceTableCell", component: ResourceTableCell } satisfies Meta<typeof ResourceTableCell>;
export default meta;
type Story = StoryObj;

export const Text: Story = { render: () => <Frame><ResourceTableCell tableId="requests" column={{ id: "customer", label: "Customer", primary: true }} row={{ id: "req_1", customer: "Maya Chen" }} /></Frame> };
export const BadgeWarning: Story = { render: () => <Frame><ResourceTableCell tableId="requests" column={{ id: "status", kind: "badge", map: { new: { label: "New", tone: "warning" } } }} row={{ id: "req_1", status: "new" }} /></Frame> };
export const BadgeSuccess: Story = { render: () => <Frame><ResourceTableCell tableId="requests" column={{ id: "status", kind: "status", map: { booked: { label: "Booked", tone: "success" } } }} row={{ id: "req_2", status: "booked" }} /></Frame> };
export const BooleanValue: Story = { render: () => <Frame><ResourceTableCell tableId="requests" column={{ id: "confirmed", kind: "boolean" }} row={{ id: "req_3", confirmed: true }} /></Frame> };
export const Actions: Story = { render: () => <ActionProbe /> };
