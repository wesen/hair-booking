/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-18 / HAIR-041 Step 80: Replaced generated generic-heavy stories with focused table fixtures.
 * - 2026-05-19 / HAIR-041 Step 105: Added visible row/bulk/pagination callback probes and mobile card viewport coverage.
 */
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ResourceTable } from "./ResourceTable";
import type { ResourceTableProps } from "./ResourceTable.types";
import type { ActionViewModel } from "../../shared";

type Row = Record<string, unknown>;

const columns: ResourceTableProps<Row>["columns"] = [
  { id: "customer", label: "Customer", kind: "text", primary: true },
  { id: "status", label: "Status", kind: "badge", map: { new: { label: "New", tone: "warning" }, booked: { label: "Booked", tone: "success" } } },
  { id: "budget", label: "Budget", kind: "text", tone: "muted" },
];

const rows: Row[] = [
  { id: "req_1", customer: "Maya Chen", status: "new", budget: "$180–$240" },
  { id: "req_2", customer: "Jules Park", status: "booked", budget: "$120–$160" },
];

const rowAction: ActionViewModel = { type: "open", target: "requests.open", label: "Open", placement: "row" };
const bulkAction: ActionViewModel = { type: "mutation", target: "requests.assign", label: "Assign", placement: "bulkToolbar" };
const nextAction: ActionViewModel = { type: "navigate", target: "requests.next", label: "Next", placement: "footer" };

function Frame({ children, narrow = false }: { children: React.ReactNode; narrow?: boolean }) {
  return <div style={{ padding: 24, maxWidth: narrow ? 390 : 980 }}>{children}</div>;
}

function CallbackProbe(args: ResourceTableProps<Row>) {
  const [last, setLast] = useState("No table callback yet.");
  return (
    <Frame>
      <ResourceTable
        {...args}
        onRowAction={(action, context) => setLast(`row:${action.target}:${String(context.row.id)}`)}
        onBulkAction={(action, context) => setLast(`bulk:${action.target}:scope=${context.scope}:selected=${context.selectedRowIds.join(",") || "none"}`)}
        onPaginationAction={(action, context) => setLast(`page:${action.target}:page=${context.page}:total=${context.total}`)}
        onSelectionChange={(context) => setLast(`selection:${context.selectedRowIds.join(",") || "none"}`)}
      />
      <output style={{ display: "block", marginTop: 12, padding: 10, border: "1px solid #dfd2bd" }}>{last}</output>
    </Frame>
  );
}

const meta = {
  title: "Admin DSL Widgets/Organisms/ResourceTable",
  component: ResourceTable,
} satisfies Meta<typeof ResourceTable>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => <Frame><ResourceTable tableId="requests" columns={columns} rows={rows} page={1} total={2} /></Frame>,
};

export const SelectableWithBulkActions: Story = {
  render: () => (
    <CallbackProbe
      tableId="requests"
      columns={columns}
      rows={rows}
      selectable
      selectedRowIds={["req_1"]}
      bulkActions={[bulkAction]}
      page={1}
      total={2}
    />
  ),
};

export const RowActions: Story = {
  render: () => <CallbackProbe tableId="requests" columns={columns} rows={rows} rowActions={[rowAction]} page={1} total={2} />,
};

export const PaginationActions: Story = {
  render: () => <CallbackProbe tableId="requests" columns={columns} rows={rows} pagination={{ page: 2, total: 42, actions: [nextAction] }} page={2} total={42} actions={[nextAction]} />,
};

export const MobileCards: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => <Frame narrow><ResourceTable tableId="requests" columns={columns} rows={rows} rowActions={[rowAction]} page={1} total={2} /></Frame>,
};

export const Empty: Story = {
  render: () => <Frame><ResourceTable tableId="requests" columns={columns} rows={[]} page={1} total={0} empty={<span>No requests match the current filters.</span>} /></Frame>,
};
