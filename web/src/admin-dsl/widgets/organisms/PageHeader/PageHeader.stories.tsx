/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-18 / HAIR-041 Step 70: Replaced generated scenario placeholders with hardened desktop/mobile fixtures and an action callback probe.
 */
import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";
import { useState } from "react";
import { color } from "../../../../fringe-ui/tokens";
import type { ActionViewModel } from "../../shared";
import { PageHeader } from "./PageHeader";
import type { PageHeaderProps } from "./PageHeader.types";

const createAction: ActionViewModel = {
  id: "create-request",
  type: "mutation",
  target: "requests.create",
  label: "Create request",
  intent: "primary",
  priority: "primary",
  placement: "pageHeader",
};

const exportAction: ActionViewModel = {
  id: "export-requests",
  type: "open",
  target: "requests.export",
  label: "Export CSV",
  placement: "pageHeader",
};

const defaultArgs = {
  id: "request-triage-header",
  title: "Request Triage",
  description: "Review customer intake requests, assign follow-up work, and keep the salon queue moving.",
  breadcrumbs: ["Admin", "Requests"],
  primaryActions: [createAction, exportAction],
} satisfies PageHeaderProps;

const meta = {
  title: "Admin DSL Widgets/Organisms/PageHeader",
  component: PageHeader,
  args: defaultArgs,
  parameters: {
    docs: {
      description: {
        component:
          "PageHeader owns page-level title hierarchy, breadcrumbs, description, and page-scoped actions. Raw Admin DSL parsing remains in renderer adapters.",
      },
    },
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

function Shell({ children, width = 1120 }: { children: ReactNode; width?: number }) {
  return <div style={{ padding: 24, maxWidth: width, background: color.creamDeep }}>{children}</div>;
}

export const Default: Story = {
  args: defaultArgs,
  render: (args) => (
    <Shell>
      <PageHeader {...args} />
    </Shell>
  ),
};

export const WithBreadcrumbs: Story = {
  args: {
    ...defaultArgs,
    breadcrumbs: ["Fringe", "Admin", "Config", "Draft version"],
    title: "Services & pricing",
    description: "Tune service categories, display copy, and price ranges before publishing the next intake configuration.",
  },
  render: (args) => (
    <Shell>
      <PageHeader {...args} />
    </Shell>
  ),
};

export const WithPrimaryAction: Story = {
  args: {
    ...defaultArgs,
    title: "Configuration versions",
    description: "Create drafts from the active intake setup and publish validated changes when they are ready.",
    primaryActions: [
      { id: "publish", type: "confirm", target: "config.publish", label: "Publish draft", intent: "primary", priority: "primary", placement: "pageHeader", requiresConfirmation: true },
      { id: "preview", type: "open", target: "config.preview", label: "Preview", placement: "pageHeader" },
    ],
  },
  render: (args) => (
    <Shell>
      <PageHeader {...args} />
    </Shell>
  ),
};

export const LongTitleMobile: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  args: {
    ...defaultArgs,
    title: "Very long operational queue title that should wrap cleanly on a phone viewport",
    description: "The title should remain readable without horizontal scrolling, and actions should wrap below the copy.",
    breadcrumbs: ["Admin", "Mobile review"],
  },
  render: (args) => (
    <Shell width={390}>
      <PageHeader {...args} />
    </Shell>
  ),
};

export const NoDescription: Story = {
  args: {
    ...defaultArgs,
    title: "Audit log",
    description: undefined,
    breadcrumbs: [],
    primaryActions: [exportAction],
  },
  render: (args) => (
    <Shell>
      <PageHeader {...args} />
    </Shell>
  ),
};

export const ActionDispatch: Story = {
  args: defaultArgs,
  render: (args) => {
    const [lastAction, setLastAction] = useState<string>("none yet");
    return (
      <Shell>
        <PageHeader {...args} onPrimaryAction={(action, context) => setLastAction(`${action.target} / page=${context.pageId || "unknown"}`)} />
        <p style={{ margin: 0, color: color.softInk }}>Last action: {lastAction}</p>
      </Shell>
    );
  },
};
