/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 111: Replaced scaffold diagnostics with distinct status tone and pill fixtures.
 */
import type { Meta, StoryObj } from "@storybook/react";
import { StatusText } from "./StatusText";

const meta = {
  title: "Admin DSL Widgets/Atoms/StatusText",
  component: StatusText,
  parameters: { docs: { description: { component: "Semantic status text for mapped table/status values." } } },
} satisfies Meta<typeof StatusText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NeutralText: Story = { args: { label: "Draft", tone: "neutral" } };
export const SuccessText: Story = { args: { label: "Published", tone: "success" } };
export const WarningText: Story = { args: { label: "Needs review", tone: "warning" } };
export const DangerText: Story = { args: { label: "Failed", tone: "danger" } };
export const PillVariant: Story = { args: { label: "Booked", tone: "success", variant: "pill" } };
export const MappedFromTableValue: Story = { args: { label: "New request", tone: "warning", variant: "pill" } };
