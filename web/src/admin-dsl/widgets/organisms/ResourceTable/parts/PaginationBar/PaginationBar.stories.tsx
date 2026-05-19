import type { Meta, StoryObj } from "@storybook/react";
import { PaginationBar } from "./PaginationBar";

const meta = { title: "Admin DSL Widgets/Organisms/ResourceTable/PaginationBar", component: PaginationBar } satisfies Meta<typeof PaginationBar>;
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => <PaginationBar page={2} total={42} actions={[{ type: "navigate", target: "page.prev", label: "Previous" }, { type: "navigate", target: "page.next", label: "Next" }]} /> };
