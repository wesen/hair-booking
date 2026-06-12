/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 111: Replaced scaffold diagnostics with distinct markdown/text fixtures and mobile coverage.
 */
import type { Meta, StoryObj } from "@storybook/react";
import { MarkdownBlock } from "./MarkdownBlock";

const meta = { title: "Admin DSL Widgets/Molecules/MarkdownBlock", component: MarkdownBlock } satisfies Meta<typeof MarkdownBlock>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { markdown: "Review the client notes before confirming this appointment." } };
export const Muted: Story = { args: { tone: "muted", markdown: "Internal salon guidance. This copy is informational and lower priority." } };
export const Multiline: Story = { args: { markdown: "Preparation notes:\n• Confirm color history\n• Ask about scalp sensitivity\n• Reserve extra processing time" } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: "mobile1" } }, args: { markdown: "Compact helper text for a narrow admin panel.", tone: "muted" } };
