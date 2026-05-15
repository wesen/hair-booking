import { describe, expect, it, vi } from "vitest";
import { actionKey, actionList, dispatchAdminAction, isActionRef } from "./actions";
import type { AdminNode } from "./schema";

describe("admin DSL action utilities", () => {
  it("normalizes array-style and keyed action maps", () => {
    expect(actionList({
      actions: [
        { type: "open", target: "drawer", label: "Open" },
        { nope: true },
        null,
      ],
    })).toEqual([{ type: "open", target: "drawer", label: "Open" }]);

    expect(actionList({
      actions: {
        open: { type: "open", target: "drawer", label: "Open" },
        save: { type: "mutation", target: "save", label: "Save" },
        bad: { target: "missing-type" },
      },
    })).toEqual([
      { type: "open", target: "drawer", label: "Open" },
      { type: "mutation", target: "save", label: "Save" },
    ]);
  });

  it("rejects missing and invalid action shapes", () => {
    expect(actionList(undefined)).toEqual([]);
    expect(actionList({ actions: "save" })).toEqual([]);
    expect(isActionRef({ target: "save" })).toBe(false);
    expect(isActionRef({ type: "mutation", target: "save" })).toBe(true);
  });

  it("dispatches normalized events with node identity", () => {
    const dispatch = vi.fn();
    const node: AdminNode = {
      kind: "resourceRow",
      props: { id: "row-1" },
      meta: { id: "service-row" },
    };
    const action = { type: "confirm" as const, target: "archive", label: "Archive", requiresConfirmation: true };

    dispatchAdminAction({ dispatch }, node, action, { checked: true }, { slot: "row" });

    expect(dispatch).toHaveBeenCalledWith({
      nodeId: "service-row",
      nodeKind: "resourceRow",
      action,
      value: { checked: true },
      meta: { slot: "row" },
    });
    expect(actionKey(action, 2)).toBe("confirm:archive:2");
  });
});
