/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 99: Replaced generated same-args stories with initial-value/read-only/submit-probe fixtures.
 */
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { SearchBox } from "./SearchBox";
import type { SearchBoxProps } from "./SearchBox.types";
import type { ActionViewModel } from "../../shared";

const searchAction: ActionViewModel = { type: "navigate", target: "requests.search", label: "Search", placement: "toolbar" };

function Frame({ children, narrow = false }: { children: React.ReactNode; narrow?: boolean }) {
  return <div style={{ padding: 24, maxWidth: narrow ? 340 : 720 }}>{children}</div>;
}

function SearchProbe(args: SearchBoxProps) {
  const [last, setLast] = useState("No search submitted yet.");
  return (
    <Frame>
      <SearchBox {...args} onSearch={(action, context) => setLast(`${context.query || "<empty>"}:${action?.target ?? "no-action"}`)} />
      <output style={{ display: "block", marginTop: 12, padding: 10, border: "1px solid #dfd2bd" }}>{last}</output>
    </Frame>
  );
}

const meta = {
  title: "Admin DSL Widgets/Molecules/SearchBox",
  component: SearchBox,
  parameters: { docs: { description: { component: "SearchBox renders a compact admin search form and emits submitted query context." } } },
} satisfies Meta<typeof SearchBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "Search requests", placeholder: "Search by client, service, or note", action: searchAction },
  render: (args) => <Frame><SearchBox {...args} /></Frame>,
};

export const WithInitialValue: Story = {
  args: { label: "Search requests", placeholder: "Search requests", value: "balayage", action: searchAction },
  render: (args) => <Frame><SearchBox {...args} /></Frame>,
};

export const NoAction: Story = {
  args: { label: "Readonly search", placeholder: "Search disabled until data loads", value: "draft" },
  render: (args) => <Frame><SearchBox {...args} /></Frame>,
};

export const MobileSearch: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  args: { label: "Mobile search", placeholder: "Client name", action: searchAction },
  render: (args) => <Frame narrow><SearchBox {...args} /></Frame>,
};

export const SubmitDispatch: Story = {
  args: { label: "Search requests", placeholder: "Type and press Search", value: "color", action: searchAction },
  render: (args) => <SearchProbe {...args} />,
};
