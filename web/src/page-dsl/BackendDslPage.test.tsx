import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BackendDslPage, type BackendDslClient } from "./BackendDslPage";
import { DslApiError } from "./backendClient";
import { DslPageRenderer } from "./render";
import type { DslPage } from "./schema";

const servicePage: DslPage = {
  schemaVersion: 1,
  id: "intake-service",
  title: "Service",
  shell: {
    kind: "intake",
    props: {
      step: 1,
      total: 2,
      title: "What brings you in?",
      actions: { next: { id: "act_next", event: "next" } },
    },
  },
  nodes: [
    {
      kind: "segmented",
      meta: { id: "category-tabs" },
      props: {
        value: "color",
        options: [
          { value: "cut", label: "Cut" },
          { value: "color", label: "Color" },
          { value: "extensions", label: "Extensions" },
        ],
        actions: { change: { id: "act_category", event: "change" } },
      },
    },
  ],
};

const colorPage: DslPage = {
  schemaVersion: 1,
  id: "intake-color",
  title: "Color",
  shell: { kind: "bare" },
  nodes: [{ kind: "text", props: { text: "Color step" } }],
};

describe("DslPageRenderer backend action refs", () => {
  it("dispatches backend action refs from interactive nodes", () => {
    const backendDispatch = vi.fn();
    render(<DslPageRenderer page={servicePage} context={{ backendDispatch }} />);

    fireEvent.click(screen.getByRole("radio", { name: "Extensions" }));

    expect(backendDispatch).toHaveBeenCalledWith(expect.objectContaining({
      nodeId: "category-tabs",
      nodeKind: "segmented",
      actionId: "act_category",
      event: "change",
      value: "extensions",
    }));
  });

  it("dispatches backend action refs from the intake shell", () => {
    const backendDispatch = vi.fn();
    render(<DslPageRenderer page={servicePage} context={{ backendDispatch }} />);

    fireEvent.click(screen.getByRole("button", { name: "Keep going →" }));

    expect(backendDispatch).toHaveBeenCalledWith(expect.objectContaining({
      nodeId: "shell.next",
      nodeKind: "intakeShell",
      actionId: "act_next",
      event: "next",
    }));
  });
});

describe("BackendDslPage", () => {
  it("starts a backend DSL flow and replaces the page after dispatch", async () => {
    const client: BackendDslClient = {
      startDslFlow: vi.fn(async () => ({ sessionId: "flow_1", pageVersion: 1, page: servicePage })),
      getDslFlow: vi.fn(),
      postDslEvent: vi.fn(async (_sessionId, event) => ({
        sessionId: "flow_1",
        pageVersion: 2,
        page: {
          ...servicePage,
          nodes: [{
            ...servicePage.nodes[0],
            props: { ...servicePage.nodes[0].props, value: event.value },
          }],
        },
      })),
    };

    render(<BackendDslPage client={client} />);

    await screen.findByRole("radio", { name: "Extensions" });
    fireEvent.click(screen.getByRole("radio", { name: "Extensions" }));

    await waitFor(() => {
      expect(client.postDslEvent).toHaveBeenCalledWith("flow_1", expect.objectContaining({
        pageVersion: 1,
        nodeId: "category-tabs",
        actionId: "act_category",
        value: "extensions",
      }));
    });
  });

  it("can fetch an existing backend DSL session", async () => {
    const client: BackendDslClient = {
      startDslFlow: vi.fn(),
      getDslFlow: vi.fn(async () => ({ sessionId: "flow_existing", pageVersion: 7, page: colorPage })),
      postDslEvent: vi.fn(),
    };

    render(<BackendDslPage sessionId="flow_existing" client={client} />);

    await screen.findByText("Color step");
    expect(client.getDslFlow).toHaveBeenCalledWith("flow_existing");
    expect(client.startDslFlow).not.toHaveBeenCalled();
  });

  it("starts a replacement flow when a remembered session is gone", async () => {
    const onSessionRecovered = vi.fn();
    const client: BackendDslClient = {
      startDslFlow: vi.fn(async () => ({ sessionId: "flow_new", pageVersion: 1, page: servicePage })),
      getDslFlow: vi.fn(async () => {
        throw new DslApiError("DSL session not found", { code: "dsl_session_not_found", status: 404 });
      }),
      postDslEvent: vi.fn(),
    };

    render(<BackendDslPage sessionId="flow_missing" client={client} onSessionRecovered={onSessionRecovered} />);

    await screen.findByRole("radio", { name: "Color" });
    expect(client.getDslFlow).toHaveBeenCalledWith("flow_missing");
    expect(client.startDslFlow).toHaveBeenCalled();
    expect(onSessionRecovered).toHaveBeenCalledWith("DSL session not found");
  });
});
