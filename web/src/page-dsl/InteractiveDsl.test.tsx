import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { page, n } from "./builder";
import { DslPageRenderer } from "./render";

describe("interactive DSL renderer", () => {
  it("routes chipGroup changes through named DSL action payloads", () => {
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

  it("routes selectableGroup changes through named DSL action payloads", () => {
    const onServiceChanged = vi.fn();
    const dsl = page("service", "Service")
      .bare()
      .add(n.selectableGroup([
        { value: "cut", title: "Cut", subtitle: "Trim" },
        { value: "color", title: "Color", subtitle: "Gloss" },
      ], "cut", { mode: "single", action: "serviceChanged" }))
      .toJSON();

    const { container } = render(<DslPageRenderer page={dsl} context={{ actions: { serviceChanged: onServiceChanged } }} />);

    // SelectableGroup renders divs with onClick, not buttons — click the second item
    const items = container.querySelectorAll("[data-dsl-kind='selectableGroup'] > div");
    expect(items.length).toBe(2);
    fireEvent.click(items[1]);

    expect(onServiceChanged).toHaveBeenCalledWith(expect.objectContaining({
      action: "serviceChanged",
      value: "color",
      node: expect.objectContaining({ kind: "selectableGroup" }),
    }));
  });

  it("routes uploadTile actions", () => {
    const onUpload = vi.fn();
    const dsl = page("photos", "Photos")
      .bare()
      .add(n.uploadTile("front", { value: "front", actions: { upload: { id: "act_upload", event: "upload" } } }))
      .toJSON();

    const { container } = render(<DslPageRenderer page={dsl} context={{ backendDispatch: onUpload }} />);

    const tile = container.querySelector("[data-dsl-kind='uploadTile']");
    expect(tile).toBeTruthy();
    fireEvent.click(tile!);

    expect(onUpload).toHaveBeenCalledWith(expect.objectContaining({
      actionId: "act_upload",
      event: "upload",
    }));
  });
});
