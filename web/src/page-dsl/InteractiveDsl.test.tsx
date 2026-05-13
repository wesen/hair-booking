import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { page, n } from "./builder";
import { DslPageRenderer } from "./render";

describe("interactive DSL renderer", () => {
  it("routes ChipGroup changes through named DSL action payloads", () => {
    const onTonesChanged = vi.fn();
    const dsl = page("tones", "Tones")
      .bare()
      .add(n.chipGroup([{ value: "warm", label: "Warm" }, { value: "cool", label: "Cool" }], ["warm"], { action: "tonesChanged" }))
      .toJSON();

    render(<DslPageRenderer page={dsl} context={{ actions: { tonesChanged: onTonesChanged } }} />);

    fireEvent.click(screen.getByRole("button", { name: "Cool" }));

    expect(onTonesChanged).toHaveBeenCalledWith(expect.objectContaining({
      action: "tonesChanged",
      value: ["warm", "cool"],
      node: expect.objectContaining({ kind: "chipGroup" }),
    }));
  });

  it("routes ServiceOptionGroup changes through named DSL action payloads", () => {
    const onServiceChanged = vi.fn();
    const dsl = page("service", "Service")
      .bare()
      .add(n.serviceOptionGroup([
        { value: "cut", name: "Cut", description: "Trim" },
        { value: "color", name: "Color", description: "Gloss" },
      ], "cut", { action: "serviceChanged" }))
      .toJSON();

    render(<DslPageRenderer page={dsl} context={{ actions: { serviceChanged: onServiceChanged } }} />);

    fireEvent.click(screen.getByRole("button", { name: /Color/ }));

    expect(onServiceChanged).toHaveBeenCalledWith(expect.objectContaining({
      action: "serviceChanged",
      value: "color",
      node: expect.objectContaining({ kind: "serviceOptionGroup" }),
    }));
  });

  it("routes PhotoTile upload/remove actions independently", () => {
    const onUpload = vi.fn();
    const onRemove = vi.fn();
    const dsl = page("photos", "Photos")
      .bare()
      .add(
        n.photoTile("front", { value: "front", onUpload: "photoUploaded" }),
        n.photoTile("side", { value: "side", filled: true, onRemove: "photoRemoved" }),
      )
      .toJSON();

    render(<DslPageRenderer page={dsl} context={{ actions: { photoUploaded: onUpload, photoRemoved: onRemove } }} />);

    fireEvent.click(screen.getByRole("button", { name: "front" }));
    fireEvent.click(screen.getByRole("button", { name: "✓ side" }));

    expect(onUpload).toHaveBeenCalledWith(expect.objectContaining({ action: "photoUploaded", value: "front" }));
    expect(onRemove).toHaveBeenCalledWith(expect.objectContaining({ action: "photoRemoved", value: "side" }));
  });
});
