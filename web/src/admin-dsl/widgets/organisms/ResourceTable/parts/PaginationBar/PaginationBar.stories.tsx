/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 105: Added story changelog and visible pagination callback probe.
 */
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { PaginationBar } from "./PaginationBar";
import type { ActionViewModel } from "../../../../shared";

const actions: ActionViewModel[] = [
  { type: "navigate", target: "page.prev", label: "Previous", placement: "footer" },
  { type: "navigate", target: "page.next", label: "Next", placement: "footer" },
];

function Probe({ page, total }: { page: number; total: number }) {
  const [last, setLast] = useState("No pagination action clicked yet.");
  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <PaginationBar page={page} total={total} actions={actions} onAction={(action, context) => setLast(`${action.target}:page=${context.page}:total=${context.total}`)} />
      <output style={{ display: "block", marginTop: 12, padding: 10, border: "1px solid #dfd2bd" }}>{last}</output>
    </div>
  );
}

const meta = { title: "Admin DSL Widgets/Organisms/ResourceTable/PaginationBar", component: PaginationBar } satisfies Meta<typeof PaginationBar>;
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => <Probe page={2} total={42} /> };
export const FirstPage: Story = { render: () => <Probe page={1} total={42} /> };
