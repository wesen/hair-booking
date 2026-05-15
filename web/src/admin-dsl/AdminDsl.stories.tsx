import type { Meta, StoryObj } from "@storybook/react";
import { AdminPageRenderer } from "./render";
import { adminDslExamples, dashboardAdminPage, servicesAdminPage, calendarAdminPage } from "./examples";
import type { AdminPage } from "./schema";

function AdminDslStory({ page }: { page: AdminPage }) {
  return <AdminPageRenderer page={page} context={{ dispatch: (event) => console.log("admin dsl event", event) }} />;
}

const meta: Meta<typeof AdminDslStory> = {
  title: "Admin DSL/Rendered Pages",
  component: AdminDslStory,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof AdminDslStory>;

export const ServicesPricing: Story = {
  name: "Services & Pricing",
  args: { page: servicesAdminPage },
};

export const Dashboard: Story = {
  args: { page: dashboardAdminPage },
};

export const Calendar: Story = {
  args: { page: calendarAdminPage },
};

export const JsonContract: Story = {
  name: "JSON contract",
  parameters: { layout: "padded" },
  render: () => (
    <pre style={{ fontSize: 12, maxWidth: 1100, whiteSpace: "pre-wrap" }}>
      {JSON.stringify(adminDslExamples, null, 2)}
    </pre>
  ),
};
