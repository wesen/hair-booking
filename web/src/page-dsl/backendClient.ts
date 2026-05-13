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

export class DslApiError extends Error {
  readonly code?: string;
  readonly status: number;

  constructor(message: string, options: { code?: string; status: number }) {
    super(message);
    this.name = "DslApiError";
    this.code = options.code;
    this.status = options.status;
  }
}

async function readEnvelope<T>(response: Response): Promise<T> {
  let envelope: ApiEnvelope<T>;
  try {
    envelope = await response.json() as ApiEnvelope<T>;
  } catch (err) {
    throw new DslApiError(`DSL response was not valid JSON: ${err instanceof Error ? err.message : String(err)}`, {
      status: response.status,
    });
  }

  if (!response.ok || envelope.error) {
    const message = envelope.error?.message || `DSL request failed with status ${response.status}`;
    throw new DslApiError(message, { code: envelope.error?.code, status: response.status });
  }
  if (!envelope.data) {
    throw new DslApiError("DSL response did not include data", { status: response.status });
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
