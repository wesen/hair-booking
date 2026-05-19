import type { Meta, StoryObj } from "@storybook/react";
import { BulkActionBar } from "./BulkActionBar";

const meta = { title: "Admin DSL Widgets/Organisms/ResourceTable/BulkActionBar", component: BulkActionBar } satisfies Meta<typeof BulkActionBar>;
export default meta;
type Story = StoryObj;

export const VisibleScope: Story = { render: () => <BulkActionBar tableId="requests" rows={[{ id: "req_1" }, { id: "req_2" }]} selectedRowIds={[]} actions={[{ type: "mutation", target: "assign", label: "Assign", placement: "bulkToolbar" }]} /> };
export const SelectedScope: Story = { render: () => <BulkActionBar tableId="requests" rows={[{ id: "req_1" }, { id: "req_2" }]} selectedRowIds={["req_1"]} actions={[{ type: "mutation", target: "archive", label: "Archive", intent: "danger", placement: "bulkToolbar" }]} /> };
