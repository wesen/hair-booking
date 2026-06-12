/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 113: Replaced scaffold diagnostics with populated, status, empty, responsive, and callback-probe fixtures.
 */
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ImageGrid } from "./ImageGrid";

const items = [
  { id: "front", title: "Front reference", subtitle: "Client upload", status: "Uploaded", tone: "success" },
  { id: "side", title: "Side profile", subtitle: "Required for consultation", status: "Missing", tone: "warning" },
  { id: "inspo", title: "Inspiration", subtitle: "Pinterest reference" },
];

function Probe() {
  const [last, setLast] = useState("No image-grid action clicked yet.");
  return <div><ImageGrid items={items} actions={[{ type: "open", target: "asset.open", label: "Open", placement: "detail" }]} onAction={(action, context) => setLast(`${action.target}:${context.item.id}`)} /><output style={{ display: "block", marginTop: 12, padding: 10, border: "1px solid #dfd2bd" }}>{last}</output></div>;
}

const meta = { title: "Admin DSL Widgets/Organisms/ImageGrid", component: ImageGrid } satisfies Meta<typeof ImageGrid>;
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => <ImageGrid items={items.slice(0, 2)} /> };
export const WithStatuses: Story = { render: () => <ImageGrid items={items} /> };
export const Empty: Story = { render: () => <ImageGrid items={[]} /> };
export const CardActionProbe: Story = { render: () => <Probe /> };
export const ResponsiveGrid: Story = { parameters: { viewport: { defaultViewport: "mobile1" } }, render: () => <ImageGrid items={items} /> };
