/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 111: Replaced scaffold diagnostics with activity fixtures and action callback probe.
 */
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ActivityFeed } from "./ActivityFeed";
import type { ActivityFeedItem } from "./ActivityFeed.types";

const items: ActivityFeedItem[] = [
  { time: "09:15", title: "Request created", body: "Maya uploaded four reference photos." },
  { time: "09:42", title: "Stylist note added", body: "Recommended color consultation before booking." },
];
const actionableItems: ActivityFeedItem[] = [{ ...items[0], action: { type: "open", target: "activity.open", label: "Open", placement: "row" } }, items[1]];

function Probe() {
  const [last, setLast] = useState("No activity action clicked yet.");
  return <div style={{ padding: 24, maxWidth: 760 }}><ActivityFeed items={actionableItems} onItemAction={(action, context) => setLast(`${action.target}:${context.item.title}`)} /><output style={{ display: "block", marginTop: 12, padding: 10, border: "1px solid #dfd2bd" }}>{last}</output></div>;
}

const meta = { title: "Admin DSL Widgets/Molecules/ActivityFeed", component: ActivityFeed } satisfies Meta<typeof ActivityFeed>;
export default meta;
type Story = StoryObj;

export const Default: Story = { args: { items } };
export const WithItemAction: Story = { render: () => <Probe /> };
export const LongBody: Story = { args: { items: [{ time: "11:30", title: "Policy update", body: "The client requested a major color correction and attached detailed notes about previous salon history, sensitivity concerns, and preferred appointment windows." }] } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: "mobile1" } }, args: { items: actionableItems } };
