import type { Meta, StoryObj } from "@storybook/react";
import { CalendarGrid } from "./CalendarGrid";
import { CALENDAR_DATA } from "../data/consultation-constants";

const meta: Meta<typeof CalendarGrid> = {
  title: "Stylist/Consultation/CalendarGrid",
  component: CalendarGrid,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    availability: CALENDAR_DATA,
    selectedDate: null,
    onSelectDate: () => {},
  },
};

export const WithSelection: Story = {
  args: {
    availability: CALENDAR_DATA,
    selectedDate: "2026-03-28",
    onSelectDate: () => {},
  },
};

export const EmptyMonth: Story = {
  args: {
    availability: {},
    selectedDate: null,
    onSelectDate: () => {},
  },
};
