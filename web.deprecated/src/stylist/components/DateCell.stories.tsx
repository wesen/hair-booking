import type { Meta, StoryObj } from "@storybook/react";
import { DateCell } from "./DateCell";

const meta: Meta<typeof DateCell> = {
  title: "Stylist/DateCell",
  component: DateCell,
};

export default meta;
type Story = StoryObj<typeof DateCell>;

export const Default: Story = {
  args: {
    dayLabel: "Mon",
    dayNum: 20,
  },
};

export const Selected: Story = {
  args: {
    dayLabel: "Wed",
    dayNum: 22,
    selected: true,
  },
};

export const DateRow: Story = {
  render: () => {
    const days = [
      { dayLabel: "Mon", dayNum: 20 },
      { dayLabel: "Tue", dayNum: 21 },
      { dayLabel: "Wed", dayNum: 22 },
      { dayLabel: "Thu", dayNum: 23 },
      { dayLabel: "Fri", dayNum: 24 },
      { dayLabel: "Sat", dayNum: 25 },
      { dayLabel: "Sun", dayNum: 26 },
    ];

    return (
      <div data-part="date-selector">
        {days.map((day) => (
          <DateCell
            key={day.dayNum}
            dayLabel={day.dayLabel}
            dayNum={day.dayNum}
            selected={day.dayNum === 22}
          />
        ))}
      </div>
    );
  },
};
