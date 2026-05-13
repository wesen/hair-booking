import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ServiceOptionGroup } from "./molecules/ServiceOption/ServiceOptionGroup";
import { BudgetOptionGroup } from "./molecules/BudgetOption/BudgetOptionGroup";
import { TimeSlotGroup } from "./molecules/TimeSlot/TimeSlotGroup";
import { DayPickerGrid } from "./molecules/DayCell/DayPickerGrid";

const services = [
  { value: "cut", name: "Cut", description: "Trim" },
  { value: "color", name: "Color", description: "Gloss" },
];

const budgets = [
  { value: "low", label: "$100", description: "Refresh" },
  { value: "high", label: "$300", description: "Full color" },
];

const times = [
  { value: "10", label: "10:00a" },
  { value: "14", label: "2:00p" },
];

const days = [
  { value: "17", day: 17 },
  { value: "18", day: 18 },
];

describe("selection group components", () => {
  it("ServiceOptionGroup emits next selected service", () => {
    const onChange = vi.fn();
    render(<ServiceOptionGroup options={services} value="cut" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: /Color/ }));

    expect(onChange).toHaveBeenCalledWith(
      "color",
      expect.objectContaining({ value: "color", previousValue: "cut", item: services[1] }),
    );
  });

  it("BudgetOptionGroup can manage uncontrolled state", () => {
    render(<BudgetOptionGroup options={budgets} defaultValue="low" />);

    const low = screen.getByRole("button", { name: /\$100/ });
    const high = screen.getByRole("button", { name: /\$300/ });

    expect(low).toHaveAttribute("aria-pressed", "true");
    expect(high).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(high);

    expect(low).toHaveAttribute("aria-pressed", "false");
    expect(high).toHaveAttribute("aria-pressed", "true");
  });

  it("TimeSlotGroup ignores disabled options", () => {
    const onChange = vi.fn();
    render(<TimeSlotGroup options={[times[0], { ...times[1], disabled: true }]} value="10" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "2:00p" }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it("DayPickerGrid emits selected day", () => {
    const onChange = vi.fn();
    render(<DayPickerGrid days={days} value="17" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "18" }));

    expect(onChange).toHaveBeenCalledWith(
      "18",
      expect.objectContaining({ value: "18", previousValue: "17", item: days[1] }),
    );
  });
});
