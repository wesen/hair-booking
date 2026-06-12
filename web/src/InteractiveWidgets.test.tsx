import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Segmented } from "./atoms/Segmented/Segmented";
import { RatingBar } from "./atoms/RatingBar/RatingBar";
import { ServiceOption } from "./molecules/ServiceOption/ServiceOption";
import { PhotoTile } from "./molecules/PhotoTile/PhotoTile";

describe("app-ready selectable widget callbacks", () => {
  it("Segmented emits next value and previous value metadata", () => {
    const onChange = vi.fn();
    render(<Segmented options={["cut", "color"]} value="cut" onChange={onChange} />);

    fireEvent.click(screen.getByRole("radio", { name: "color" }));

    expect(onChange).toHaveBeenCalledWith(
      "color",
      expect.objectContaining({ value: "color", previousValue: "cut", action: "select" }),
    );
  });

  it("RatingBar emits selected numeric value", () => {
    const onChange = vi.fn();
    render(<RatingBar label="Damage" value={2} interactive onChange={onChange} />);

    fireEvent.click(screen.getByRole("radio", { name: "4" }));

    expect(onChange).toHaveBeenCalledWith(
      4,
      expect.objectContaining({ value: "4", previousValue: 2, action: "select" }),
    );
  });

  it("ServiceOption emits selected value", () => {
    const onSelect = vi.fn();
    render(<ServiceOption value="highlights" name="Highlights" description="Partial" onSelect={onSelect} />);

    fireEvent.click(screen.getByRole("button", { name: /Highlights/ }));

    expect(onSelect).toHaveBeenCalledWith(
      "highlights",
      expect.objectContaining({ value: "highlights", action: "select" }),
    );
  });

  it("PhotoTile emits upload and remove callbacks based on filled state", () => {
    const onUpload = vi.fn();
    const onRemove = vi.fn();
    const { rerender } = render(<PhotoTile value="front" label="Front" onUpload={onUpload} onRemove={onRemove} />);

    fireEvent.click(screen.getByRole("button", { name: "Front" }));
    expect(onUpload).toHaveBeenCalledWith("front", expect.objectContaining({ action: "upload" }));

    rerender(<PhotoTile value="front" label="Front" filled onUpload={onUpload} onRemove={onRemove} />);
    fireEvent.click(screen.getByRole("button", { name: "✓ Front" }));
    expect(onRemove).toHaveBeenCalledWith("front", expect.objectContaining({ action: "remove" }));
  });
});
