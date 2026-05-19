import type { Meta, StoryObj } from "@storybook/react";
import { ResourceTableCell } from "./ResourceTableCell";

const meta = { title: "Admin DSL Widgets/Organisms/ResourceTable/ResourceTableCell", component: ResourceTableCell } satisfies Meta<typeof ResourceTableCell>;
export default meta;
type Story = StoryObj;

export const Text: Story = { render: () => <ResourceTableCell tableId="requests" column={{ id: "customer", label: "Customer", primary: true }} row={{ id: "req_1", customer: "Maya Chen" }} /> };
export const Badge: Story = { render: () => <ResourceTableCell tableId="requests" column={{ id: "status", kind: "badge", map: { new: { label: "New", tone: "warning" } } }} row={{ id: "req_1", status: "new" }} /> };
export const Actions: Story = { render: () => <ResourceTableCell tableId="requests" column={{ id: "actions", kind: "actions" }} row={{ id: "req_1", actions: [{ type: "open", target: "requests.open", label: "Open", placement: "row" }] }} /> };
