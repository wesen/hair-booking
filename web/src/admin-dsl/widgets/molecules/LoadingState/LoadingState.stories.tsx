/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 108: Replaced scaffold diagnostics with distinct loading fixtures and mobile coverage.
 */
import type { Meta, StoryObj } from "@storybook/react";
import { LoadingState } from "./LoadingState";

const meta = {
  title: "Admin DSL Widgets/Molecules/LoadingState",
  component: LoadingState,
  parameters: {
    docs: { description: { component: "Accessible loading state for async admin panes and inline data refreshes." } },
  },
} satisfies Meta<typeof LoadingState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { title: "Loading requests" },
};

export const WithBody: Story = {
  args: { title: "Refreshing salon calendar", body: "Checking holds, time-off blocks, and recently confirmed appointments." },
};

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  args: { title: "Syncing", body: "This compact state fits narrow admin panes." },
};
