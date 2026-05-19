/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-18 / HAIR-041 Step 80: Replaced generated generic-heavy stories with focused table fixtures.
 */
import type { Meta, StoryObj } from "@storybook/react";
import { ResourceTable } from "./ResourceTable";
import type { ResourceTableProps } from "./ResourceTable.types";

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

const meta = {
  title: "Admin DSL Widgets/Organisms/ResourceTable",
  component: ResourceTable,
} satisfies Meta<typeof ResourceTable>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => <ResourceTable tableId="requests" columns={columns} rows={rows} page={1} total={2} />,
};

export const SelectableWithBulkActions: Story = {
  render: () => (
    <ResourceTable
      tableId="requests"
      columns={columns}
      rows={rows}
      selectable
      selectedRowIds={["req_1"]}
      bulkActions={[{ type: "mutation", target: "requests.assign", label: "Assign", placement: "bulkToolbar" }]}
      page={1}
      total={2}
    />
  ),
};

export const RowActions: Story = {
  render: () => <ResourceTable tableId="requests" columns={columns} rows={rows} rowActions={[{ type: "open", target: "requests.open", label: "Open", placement: "row" }]} page={1} total={2} />,
};

export const Empty: Story = {
  render: () => <ResourceTable tableId="requests" columns={columns} rows={[]} page={1} total={0} empty={<span>No requests match the current filters.</span>} />,
};
