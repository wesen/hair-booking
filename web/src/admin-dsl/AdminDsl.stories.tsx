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

const servicesPricingModalPage: AdminPage = {
  ...servicesAdminPage,
  modals: servicesAdminPage.modals?.filter((node) => node.kind === "modal"),
  drawers: [],
};

const servicesPricingConfirmPage: AdminPage = {
  ...servicesAdminPage,
  modals: servicesAdminPage.modals?.filter((node) => node.kind === "confirmDialog"),
  drawers: [],
};

const dashboardDrawerPage: AdminPage = {
  ...dashboardAdminPage,
  modals: [],
  drawers: dashboardAdminPage.drawers,
};

export const ServicesPricing: Story = {
  name: "Services & Pricing",
  args: { page: servicesAdminPage },
};

export const ServicesPricingModalOpen: Story = {
  name: "Services & Pricing — Modal Open",
  args: { page: servicesPricingModalPage },
};

export const ServicesPricingConfirmOpen: Story = {
  name: "Services & Pricing — Confirm Open",
  args: { page: servicesPricingConfirmPage },
};

export const Dashboard: Story = {
  args: { page: dashboardAdminPage },
};

export const DashboardDrawerOpen: Story = {
  name: "Dashboard — Drawer Open",
  args: { page: dashboardDrawerPage },
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
