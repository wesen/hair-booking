import { describe, expect, it } from "vitest";
import { fromJson, toJson } from "@bufbuild/protobuf";
import { DslErrorSchema, FlowStateSchema, InteractionEventSchema, PageSchema } from "../pb/proto/fringe/dsl/v1/dsl_pb";

describe("DSL protobuf JSON contract", () => {
  it("decodes protobuf DSL errors", () => {
    const error = fromJson(DslErrorSchema, {
      code: "dsl_session_not_found",
      message: "DSL session not found",
      details: { sessionId: "flow_missing" },
    });

    expect(error.code).toBe("dsl_session_not_found");
    expect(error.message).toBe("DSL session not found");
    expect(error.details).toMatchObject({ sessionId: "flow_missing" });
  });

  it("decodes the central FlowState transport envelope", () => {
    const state = fromJson(FlowStateSchema, {
      sessionId: "flow_1",
      pageVersion: 3,
      page: {
        schemaVersion: 1,
        id: "intake-service",
        title: "Service",
        shell: { kind: "intake", props: { step: 1, total: 7 } },
        nodes: [{
          kind: "summaryRow",
          meta: { id: "estimate-service" },
          props: {
            label: "Service",
            value: "Color",
            actions: { edit: { id: "act_edit", event: "edit" } },
          },
        }],
      },
      effects: [{ kind: "toast", tone: "info", message: "Saved" }],
    });

    expect(state.sessionId).toBe("flow_1");
    expect(state.pageVersion).toBe(3);
    expect(state.page?.nodes[0]?.props?.actions).toMatchObject({ edit: { id: "act_edit" } });
    expect(toJson(FlowStateSchema, state)).toMatchObject({
      sessionId: "flow_1",
      page: { id: "intake-service" },
      effects: [{ kind: "toast", tone: "info", message: "Saved" }],
    });
  });

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

  it("encodes interaction events without undefined optional value fields", () => {
    const event = fromJson(InteractionEventSchema, {
      eventId: "evt_edit",
      pageVersion: 5,
      nodeId: "estimate-service",
      nodeKind: "summaryRow",
      actionId: "act_edit",
      event: "edit",
    });

    expect(toJson(InteractionEventSchema, event)).toMatchObject({
      eventId: "evt_edit",
      pageVersion: 5,
      nodeId: "estimate-service",
      event: "edit",
    });
    expect(toJson(InteractionEventSchema, event)).not.toHaveProperty("value");
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
