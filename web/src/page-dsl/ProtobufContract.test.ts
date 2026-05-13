import { describe, expect, it } from "vitest";
import { fromJson, toJson } from "@bufbuild/protobuf";
import { PageSchema, InteractionEventSchema } from "../pb/proto/fringe/dsl/v1/dsl_pb";

describe("DSL protobuf JSON contract", () => {
  it("decodes page JSON with dynamic node props", () => {
    const page = fromJson(PageSchema, {
      schemaVersion: 1,
      id: "intake-service",
      title: "Service",
      shell: { kind: "intake", props: { step: 1, total: 2 } },
      nodes: [{
        kind: "segmented",
        meta: { id: "category-tabs" },
        props: {
          value: "color",
          actions: { change: { id: "act_category", event: "change" } },
        },
      }],
    });

    expect(page.schemaVersion).toBe(1);
    expect(page.nodes[0]?.meta?.id).toBe("category-tabs");
    expect(page.nodes[0]?.props?.value).toBe("color");
  });

  it("decodes interaction events with JSON values", () => {
    const event = fromJson(InteractionEventSchema, {
      eventId: "evt_1",
      pageVersion: 3,
      nodeId: "tone-chips",
      nodeKind: "chipGroup",
      actionId: "act_tones",
      event: "change",
      value: ["warm", "dimensional"],
      meta: { source: "test" },
    });

    expect(event.eventId).toBe("evt_1");
    expect(event.pageVersion).toBe(3);
    expect(toJson(InteractionEventSchema, event)).toMatchObject({
      value: ["warm", "dimensional"],
      meta: { source: "test" },
    });
  });
});
