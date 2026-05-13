import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Chip } from "./Chip";
import { ChipGroup } from "./ChipGroup";

describe("Chip", () => {
  it("emits selected-change metadata when toggled", () => {
    const onSelectedChange = vi.fn();

    render(
      <Chip value="warm" selected={false} onSelectedChange={onSelectedChange}>
        Warm
      </Chip>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Warm" }));

    expect(onSelectedChange).toHaveBeenCalledWith(
      true,
      expect.objectContaining({
        value: "warm",
        action: "select",
        source: "pointer",
      }),
    );
  });
});

describe("ChipGroup", () => {
  it("toggles multiple selected values", () => {
    const onChange = vi.fn();

    render(
      <ChipGroup
        label="Tone family"
        options={["neutral", "warm", "cool"]}
        value={["warm"]}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "neutral" }));

    expect(onChange).toHaveBeenCalledWith(
      ["warm", "neutral"],
      expect.objectContaining({
        value: "neutral",
        previousValue: ["warm"],
        action: "select",
      }),
    );
  });

  it("enforces single selection mode", () => {
    const onChange = vi.fn();

    render(
      <ChipGroup
        selectionMode="single"
        options={["short", "medium", "long"]}
        value={["medium"]}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "long" }));

    expect(onChange).toHaveBeenCalledWith(
      ["long"],
      expect.objectContaining({
        value: "long",
        previousValue: ["medium"],
        action: "select",
      }),
    );
  });

  it("manages its own state when uncontrolled", () => {
    render(<ChipGroup options={["dry", "frizzy"]} defaultValue={["dry"]} />);

    const dry = screen.getByRole("button", { name: "dry" });
    const frizzy = screen.getByRole("button", { name: "frizzy" });

    expect(dry).toHaveAttribute("aria-pressed", "true");
    expect(frizzy).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(frizzy);

    expect(dry).toHaveAttribute("aria-pressed", "true");
    expect(frizzy).toHaveAttribute("aria-pressed", "true");
  });
});
