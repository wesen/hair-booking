/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 99: Replaced generated same-args stories with active/read-only/wrapping fixtures and filter callback probe output.
 */
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FilterBar } from "./FilterBar";
import type { FilterBarProps } from "./FilterBar.types";
import type { ActionViewModel } from "../../shared";

const filterAction: ActionViewModel = { type: "navigate", target: "requests.filter", label: "Apply filter", placement: "toolbar" };
const filters = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "photo-review", label: "Photo review" },
  { id: "quoted", label: "Quoted" },
  { id: "booked", label: "Booked" },
  { id: "archived", label: "Archived" },
];

function Frame({ children, narrow = false }: { children: React.ReactNode; narrow?: boolean }) {
  return <div style={{ padding: 24, maxWidth: narrow ? 320 : 760 }}>{children}</div>;
}

function FilterProbe(args: FilterBarProps) {
  const [last, setLast] = useState("No filter selected yet.");
  return (
    <Frame>
      <FilterBar {...args} onFilterChange={(action, context) => setLast(`${context.filter.id}:${context.filter.label}:${action?.target ?? "no-action"}`)} />
      <output style={{ display: "block", marginTop: 12, padding: 10, border: "1px solid #dfd2bd" }}>{last}</output>
    </Frame>
  );
}

const meta = {
  title: "Admin DSL Widgets/Molecules/FilterBar",
  component: FilterBar,
  parameters: { docs: { description: { component: "FilterBar renders selection pills for admin list filtering." } } },
} satisfies Meta<typeof FilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { filters: filters.slice(0, 4), value: "all", action: filterAction },
  render: (args) => <Frame><FilterBar {...args} /></Frame>,
};

export const ActiveFilter: Story = {
  args: { filters: filters.slice(0, 5), value: "photo-review", action: filterAction },
  render: (args) => <Frame><FilterBar {...args} /></Frame>,
};

export const ManyFiltersWrap: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  args: { filters, value: "booked", action: filterAction },
  render: (args) => <Frame narrow><FilterBar {...args} /></Frame>,
};

export const Readonly: Story = {
  args: { filters: filters.slice(0, 4), value: "quoted" },
  render: (args) => <Frame><FilterBar {...args} /></Frame>,
};

export const FilterDispatch: Story = {
  args: { filters: filters.slice(0, 5), value: "all", action: filterAction },
  render: (args) => <FilterProbe {...args} />,
};
