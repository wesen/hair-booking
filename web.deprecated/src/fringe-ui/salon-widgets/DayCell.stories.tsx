import type { Meta, StoryObj } from "@storybook/react";
import { DayCell } from "./DayCell";

const meta: Meta<typeof DayCell> = {
  title: "Fringe/Salon/DayCell",
  component: DayCell,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DayCell>;

export const Default: Story  = { args: { day: '18' } };
export const Selected: Story = { args: { day: '18', selected: true } };
export const Disabled: Story = { args: { day: '8', disabled: true } };
export const WithDot: Story  = { args: { day: '14', dot: true } };
export const SelectedWithDot: Story = { args: { day: '18', selected: true, dot: true } };
export const DisabledSelected: Story = { args: { day: '18', selected: true, disabled: true } };

export const CalendarGrid: Story = {
  name: "Calendar grid (7-column)",
  render: () => {
    const days = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28];
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, maxWidth: 300 }}>
        {["M", "T", "W", "T", "F", "S", "S"].map((d) => (
          <div key={d} style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: "#9a958e", textAlign: "center", padding: 4 }}>{d}</div>
        ))}
        {[1,2].map((i) => (
          <div key={`gap-${i}`} />
        ))}
        {days.slice(0, 28).map((d) => (
          <DayCell key={d} day={String(d)} selected={d === 18} disabled={d < 12} dot={[14, 17, 18, 19, 23].includes(d)} />
        ))}
      </div>
    );
  },
};

export const DesktopCalendar: Story = {
  name: "Desktop calendar (June 2025)",
  render: () => {
    const days = Array.from({ length: 30 }, (_, i) => i + 1);
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, maxWidth: 500 }}>
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: "#9a958e", textAlign: "center", padding: "6px 0 10px" }}>{d}</div>
        ))}
        {days.map((d) => {
          const has = [14, 17, 18, 19, 23, 24, 26, 30].includes(d);
          const sel = d === 18;
          const past = d < 12;
          return (
            <div key={d} style={{
              aspectRatio: "1",
              background: sel ? "#7a8f6b" : past ? "transparent" : has ? "#f6efe4" : "transparent",
              border: sel ? "none" : `1px solid #ebe7df`,
              color: sel ? "#ffffff" : past ? "#9a958e" : "#111111",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: past ? "default" : "pointer",
              padding: 8,
            }}>
              <div style={{ fontFamily: '"Anton", sans-serif', fontSize: 22 }}>{d}</div>
              {has && !sel && <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: "#7a8f6b", marginTop: 2 }}>OPEN</div>}
            </div>
          );
        })}
      </div>
    );
  },
};

export const Unstyled: Story = {
  args: { day: '18' },
  decorators: [
    () => (
      <div style={{ fontFamily: "monospace", fontSize: 12, color: "#888" }}>
        (base button element)
      </div>
    ),
  ],
};