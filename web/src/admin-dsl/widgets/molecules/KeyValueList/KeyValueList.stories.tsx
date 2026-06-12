/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 111: Replaced scaffold diagnostics with distinct key/value fixtures and mobile coverage.
 */
import type { Meta, StoryObj } from "@storybook/react";
import { KeyValueList } from "./KeyValueList";

const meta = { title: "Admin DSL Widgets/Molecules/KeyValueList", component: KeyValueList } satisfies Meta<typeof KeyValueList>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { items: [{ label: "Client", value: "Maya Chen" }, { label: "Service", value: "Color consultation" }, { label: "Budget", value: "$180–$240" }] } };
export const WideLabels: Story = { args: { labelWidth: 180, items: [{ label: "Preferred appointment window", value: "Friday afternoon" }, { label: "Photo references", value: 4 }] } };
export const MixedValues: Story = { args: { items: [{ label: "Status", value: <strong>Ready for review</strong> }, { label: "Score", value: 92 }] } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: "mobile1" } }, args: { labelWidth: 96, items: [{ label: "Client", value: "Jules Park" }, { label: "Need", value: "Bang trim and gloss" }] } };
