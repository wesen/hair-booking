import { describe, expect, it, vi } from "vitest";
import { adminInteractionEventFromRenderEvent } from "./BackendAdminDslPage";
import type { AdminRenderEvent } from "./schema";

describe("BackendAdminDslPage event conversion", () => {
  it("converts renderer events into Admin DSL backend events", () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue("evt-1" as `${string}-${string}-${string}-${string}-${string}`);
    const event: AdminRenderEvent = {
      nodeId: "row-1",
      nodeKind: "resourceRow",
      action: { id: "admin_act_1", event: "submit", type: "mutation", target: "service.save", label: "Save" },
      value: { ok: true },
      meta: { source: "test" },
    };
    expect(adminInteractionEventFromRenderEvent(event, 7)).toEqual({
      eventId: "evt-1",
      pageVersion: 7,
      nodeId: "row-1",
      nodeKind: "resourceRow",
      actionId: "admin_act_1",
      event: "submit",
      value: { ok: true },
      meta: { source: "test" },
    });
  });

  it("rejects frontend-only actions without opaque backend ids", () => {
    expect(() => adminInteractionEventFromRenderEvent({
      nodeId: "row-1",
      nodeKind: "resourceRow",
      action: { type: "open", target: "local" },
    }, 1)).toThrow(/missing opaque id/);
  });
});
