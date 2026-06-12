/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 108: Replaced scaffold diagnostics with distinct error fixtures and mobile coverage.
 */
import type { Meta, StoryObj } from "@storybook/react";
import { InlineError } from "./InlineError";

const meta = {
  title: "Admin DSL Widgets/Molecules/InlineError",
  component: InlineError,
  parameters: {
    docs: { description: { component: "Inline validation and load-failure error block for admin forms and panels." } },
  },
} satisfies Meta<typeof InlineError>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { title: "Unable to save changes" },
};

export const LongMessage: Story = {
  args: { title: "Calendar publish failed", body: "The draft includes overlapping appointment holds. Resolve the conflicts highlighted in the schedule before publishing this configuration." },
};

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  args: { title: "Upload failed", body: "Try again from a stable connection." },
};
