/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 105: Added story changelog and visible bulk-action callback probes for visible/selected scope.
 */
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { BulkActionBar } from "./BulkActionBar";
import type { ActionViewModel } from "../../../../shared";

const rows = [{ id: "req_1", customer: "Maya" }, { id: "req_2", customer: "Jules" }];
const assignAction: ActionViewModel = { type: "mutation", target: "assign", label: "Assign", placement: "bulkToolbar" };
const archiveAction: ActionViewModel = { type: "mutation", target: "archive", label: "Archive", intent: "danger", placement: "bulkToolbar" };

function Probe({ selectedRowIds, actions }: { selectedRowIds: string[]; actions: ActionViewModel[] }) {
  const [last, setLast] = useState("No bulk action clicked yet.");
  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <BulkActionBar tableId="requests" rows={rows} selectedRowIds={selectedRowIds} actions={actions} onBulkAction={(action, context) => setLast(`${action.target}:scope=${context.scope}:rows=${context.rows.length}:selected=${context.selectedRowIds.join(",") || "none"}`)} />
      <output style={{ display: "block", marginTop: 12, padding: 10, border: "1px solid #dfd2bd" }}>{last}</output>
    </div>
  );
}

const meta = { title: "Admin DSL Widgets/Organisms/ResourceTable/BulkActionBar", component: BulkActionBar } satisfies Meta<typeof BulkActionBar>;
export default meta;
type Story = StoryObj;

export const VisibleScope: Story = { render: () => <Probe selectedRowIds={[]} actions={[assignAction]} /> };
export const SelectedScope: Story = { render: () => <Probe selectedRowIds={["req_1"]} actions={[archiveAction]} /> };
