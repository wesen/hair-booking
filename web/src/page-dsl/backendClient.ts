import type { DslBackendEvent, DslPage } from "./schema";

export interface DslFlowState {
  sessionId: string;
  pageVersion: number;
  page: DslPage;
  effects?: DslEffect[];
}

export interface DslEffect {
  kind: string;
  tone?: string;
  message?: string;
  payload?: Record<string, unknown>;
}

export interface DslInteractionEvent extends DslBackendEvent {
  eventId: string;
  pageVersion: number;
}

interface ApiEnvelope<T> {
  data?: T;
  error?: { code: string; message: string };
}

async function readEnvelope<T>(response: Response): Promise<T> {
  const envelope = await response.json() as ApiEnvelope<T>;
  if (!response.ok || envelope.error) {
    const message = envelope.error?.message || `DSL request failed with status ${response.status}`;
    throw new Error(message);
  }
  if (!envelope.data) {
    throw new Error("DSL response did not include data");
  }
  return envelope.data;
}

export async function startDslFlow(flowId = "fringe.intake.v1"): Promise<DslFlowState> {
  const response = await fetch(`/api/dsl/flows/${encodeURIComponent(flowId)}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  return readEnvelope<DslFlowState>(response);
}

export async function getDslFlow(sessionId: string): Promise<DslFlowState> {
  const response = await fetch(`/api/dsl/flows/${encodeURIComponent(sessionId)}`);
  return readEnvelope<DslFlowState>(response);
}

export async function postDslEvent(sessionId: string, event: DslInteractionEvent): Promise<DslFlowState> {
  const response = await fetch(`/api/dsl/flows/${encodeURIComponent(sessionId)}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });
  return readEnvelope<DslFlowState>(response);
}
