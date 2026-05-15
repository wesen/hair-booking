import type { Meta, StoryObj } from "@storybook/react";
import { AdminPageRenderer } from "./render";
import {
  analyticsOpsPage,
  cmsPublishingPage,
  commerceOrdersPage,
  courseAdminPage,
  mediaLibraryPage,
  supportInboxPage,
  teamSettingsPage,
} from "./layoutExamples";
import type { AdminPage } from "./schema";

const pages = {
  commerceOrders: commerceOrdersPage,
  courseAdmin: courseAdminPage,
  cmsPublishing: cmsPublishingPage,
  supportInbox: supportInboxPage,
  mediaLibrary: mediaLibraryPage,
  analyticsOps: analyticsOpsPage,
  teamSettings: teamSettingsPage,
};

function Frame({ page, width }: { page: AdminPage; width: number | "100%" }) {
  return (
    <div style={{ width, maxWidth: "100%", minHeight: 720, border: "1px solid #d8d0c3", background: "#efe6d4", overflow: "auto" }}>
      <AdminPageRenderer page={page} context={{ dispatch: (event) => console.log("admin layout event", event) }} />
    </div>
  );
}

function LayoutStory({ page, width = "100%" }: { page: AdminPage; width?: number | "100%" }) {
  return <Frame page={page} width={width} />;
}

function MatrixStory({ page }: { page: AdminPage }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "390px minmax(720px, 1fr)", gap: 24, alignItems: "start", overflowX: "auto" }}>
      <div>
        <h2 style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5 }}>Mobile 390</h2>
        <Frame page={page} width={390} />
      </div>
      <div>
        <h2 style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5 }}>Desktop flexible</h2>
        <Frame page={page} width="100%" />
      </div>
    </div>
  );
}

const meta: Meta<typeof LayoutStory> = {
  title: "Admin DSL/Layout Catalog",
  component: LayoutStory,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof LayoutStory>;
type Matrix = StoryObj<typeof MatrixStory>;

export const CommerceOrdersDesktop: Story = { args: { page: pages.commerceOrders, width: "100%" } };
export const CommerceOrdersMobile: Story = { args: { page: pages.commerceOrders, width: 390 } };
export const CommerceOrdersMatrix: Matrix = { render: () => <MatrixStory page={pages.commerceOrders} /> };

export const CourseBuilderDesktop: Story = { args: { page: pages.courseAdmin, width: "100%" } };
export const CourseBuilderMobile: Story = { args: { page: pages.courseAdmin, width: 390 } };
export const CourseBuilderMatrix: Matrix = { render: () => <MatrixStory page={pages.courseAdmin} /> };

export const CmsPublishingDesktop: Story = { args: { page: pages.cmsPublishing, width: "100%" } };
export const CmsPublishingMobile: Story = { args: { page: pages.cmsPublishing, width: 390 } };
export const CmsPublishingMatrix: Matrix = { render: () => <MatrixStory page={pages.cmsPublishing} /> };

export const SupportInboxDesktop: Story = { args: { page: pages.supportInbox, width: "100%" } };
export const SupportInboxMobile: Story = { args: { page: pages.supportInbox, width: 390 } };
export const SupportInboxMatrix: Matrix = { render: () => <MatrixStory page={pages.supportInbox} /> };

export const MediaLibraryDesktop: Story = { args: { page: pages.mediaLibrary, width: "100%" } };
export const MediaLibraryMobile: Story = { args: { page: pages.mediaLibrary, width: 390 } };
export const MediaLibraryMatrix: Matrix = { render: () => <MatrixStory page={pages.mediaLibrary} /> };

export const AnalyticsOpsDesktop: Story = { args: { page: pages.analyticsOps, width: "100%" } };
export const AnalyticsOpsMobile: Story = { args: { page: pages.analyticsOps, width: 390 } };
export const AnalyticsOpsMatrix: Matrix = { render: () => <MatrixStory page={pages.analyticsOps} /> };

export const TeamSettingsDesktop: Story = { args: { page: pages.teamSettings, width: "100%" } };
export const TeamSettingsMobile: Story = { args: { page: pages.teamSettings, width: 390 } };
export const TeamSettingsMatrix: Matrix = { render: () => <MatrixStory page={pages.teamSettings} /> };

export const LayoutJsonContract: Story = {
  name: "Layout JSON contract",
  parameters: { layout: "padded" },
  render: () => (
    <pre style={{ fontSize: 12, maxWidth: 1100, whiteSpace: "pre-wrap" }}>
      {JSON.stringify(pages, null, 2)}
    </pre>
  ),
};
