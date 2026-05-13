import { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { BackendDslPage, type BackendDslClient } from "./BackendDslPage";
import type { DslFlowState, DslInteractionEvent } from "./backendClient";
import type { DslPage } from "./schema";
import { color, font } from "../fringe-ui/tokens";

const serviceOptions = [
  { value: "cut", name: "Cut", description: "Trim · restyle · bangs", rate: "$80+" },
  { value: "highlights", name: "Highlights", description: "Partial · full · balayage", rate: "$180+" },
  { value: "gloss", name: "Gloss refresh", description: "Tone · shine · maintenance", rate: "$120+" },
];

const toneOptions = [
  { value: "neutral", label: "Neutral" },
  { value: "warm", label: "Warm" },
  { value: "cool", label: "Cool" },
  { value: "dimensional", label: "Dimensional" },
  { value: "low-maintenance", label: "Low upkeep" },
];

function buildServicePage(state: { category: string; service: string; tones: string[]; damage: number }): DslPage {
  return {
    schemaVersion: 1,
    id: "intake-service",
    title: "Service",
    shell: {
      kind: "intake",
      props: {
        step: 1,
        total: 2,
        eyebrow: "Goja · Step I",
        title: "What brings you in?",
        actions: {
          next: { id: "act_next", event: "next" },
          skip: { id: "act_skip", event: "skip" },
        },
      },
    },
    nodes: [
      { kind: "text", props: { text: "This Storybook demo uses the same HTTP-shaped contract as the Goja backend endpoints.", variant: "editorial", style: { marginBottom: 16 } } },
      {
        kind: "segmented",
        meta: { id: "category-tabs" },
        props: {
          value: state.category,
          options: [
            { value: "cut", label: "Cut" },
            { value: "color", label: "Color" },
            { value: "extensions", label: "Extensions" },
          ],
          actions: { change: { id: "act_category", event: "change" } },
          style: { marginBottom: 16 },
        },
      },
      {
        kind: "selectableGroup",
        meta: { id: "service-options" },
        props: {
          value: state.service,
          mode: "single",
          options: serviceOptions.map((o: any) => ({ value: o.value, title: o.name, subtitle: o.description, badge: o.rate })),
          actions: { change: { id: "act_service", event: "change" } },
        },
      },
    ],
  };
}

function buildColorPage(state: { category: string; service: string; tones: string[]; damage: number }): DslPage {
  return {
    schemaVersion: 1,
    id: "intake-color",
    title: "Color",
    shell: {
      kind: "intake",
      props: {
        step: 2,
        total: 2,
        eyebrow: "Goja · Step II",
        title: "Tune the plan",
        actions: {
          back: { id: "act_back", event: "back" },
          next: { id: "act_finish", event: "next" },
        },
      },
    },
    nodes: [
      {
        kind: "chipGroup",
        meta: { id: "tone-chips" },
        props: {
          label: "Tone family",
          helperText: "These values round-trip through the backend event contract.",
          value: state.tones,
          options: toneOptions,
          actions: { change: { id: "act_tones", event: "change" } },
        },
      },
      {
        kind: "scale",
        meta: { id: "damage-rating" },
        props: {
          label: "Damage",
          value: state.damage,
          max: 5,
          interactive: true,
          actions: { change: { id: "act_damage", event: "change" } },
          style: { marginTop: 14 },
        },
      },
    ],
  };
}

function createMockBackendClient(onEvent: (event: DslInteractionEvent) => void): BackendDslClient {
  let formState = { category: "color", service: "highlights", tones: ["dimensional"], damage: 2 };
  let pageVersion = 1;
  let currentPage = buildServicePage(formState);

  function snapshot(effects: DslFlowState["effects"] = []): DslFlowState {
    return { sessionId: "storybook-flow", pageVersion, page: currentPage, effects };
  }

  return {
    startDslFlow: async () => snapshot(),
    getDslFlow: async () => snapshot(),
    postDslEvent: async (_sessionId, event) => {
      onEvent(event);
      if (event.actionId === "act_category") formState = { ...formState, category: String(event.value) };
      if (event.actionId === "act_service") formState = { ...formState, service: String(event.value) };
      if (event.actionId === "act_tones" && Array.isArray(event.value)) formState = { ...formState, tones: event.value.map(String) };
      if (event.actionId === "act_damage") formState = { ...formState, damage: Number(event.value) };
      if (event.actionId === "act_next" || event.actionId === "act_skip") currentPage = buildColorPage(formState);
      else if (event.actionId === "act_back") currentPage = buildServicePage(formState);
      else currentPage = currentPage.id === "intake-color" ? buildColorPage(formState) : buildServicePage(formState);
      pageVersion += 1;
      return snapshot([{ kind: "toast", tone: "info", message: `${event.event}: ${event.actionId}` }]);
    },
  };
}

const meta: Meta = {
  title: "Page DSL/Backend Goja Flow",
  parameters: { layout: "fullscreen", phone: true },
};

export default meta;
type Story = StoryObj;

export const MockedBackendFlow: Story = {
  render: () => {
    const [lastEvent, setLastEvent] = useState<DslInteractionEvent | null>(null);
    const client = useMemo(() => createMockBackendClient(setLastEvent), []);

    return (
      <div style={{ height: "100%", position: "relative" }}>
        <BackendDslPage client={client} />
        {lastEvent ? (
          <pre style={{
            position: "absolute",
            left: 18,
            right: 18,
            top: 74,
            maxHeight: 86,
            overflow: "hidden",
            margin: 0,
            padding: 8,
            background: color.cream,
            color: color.softInk,
            fontFamily: font.mono,
            fontSize: 9,
            pointerEvents: "none",
            opacity: 0.92,
          }}>
            {JSON.stringify({ actionId: lastEvent.actionId, event: lastEvent.event, value: lastEvent.value }, null, 2)}
          </pre>
        ) : null}
      </div>
    );
  },
};
