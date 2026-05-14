import { fromJson, toJson, type JsonValue as ProtoJsonValue } from "@bufbuild/protobuf";
import { DslErrorSchema, FlowStateSchema, InteractionEventSchema, type FlowState as ProtoFlowState } from "../pb/proto/fringe/dsl/v1/dsl_pb";
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

async function readProtoJSON(response: Response): Promise<unknown> {
  let payload: unknown;
  try {
    payload = await response.json();
  } catch (err) {
    throw new DslApiError(`DSL response was not valid protobuf JSON: ${err instanceof Error ? err.message : String(err)}`, {
      status: response.status,
    });
  }

  if (!response.ok) {
    try {
      const error = fromJson(DslErrorSchema, payload as ProtoJsonValue);
      throw new DslApiError(error.message || `DSL request failed with status ${response.status}`, {
        code: error.code || undefined,
        status: response.status,
      });
    } catch (err) {
      if (err instanceof DslApiError) throw err;
      throw new DslApiError(`DSL request failed with status ${response.status}`, { status: response.status });
    }
  }
  return payload;
}

function flowStateFromProto(state: ProtoFlowState): DslFlowState {
  if (!state.page) {
    throw new DslApiError("DSL flow state did not include a page", { status: 200 });
  }
  return {
    sessionId: state.sessionId,
    pageVersion: state.pageVersion,
    page: state.page as unknown as DslPage,
    effects: state.effects.map((effect) => ({
      kind: effect.kind,
      tone: effect.tone || undefined,
      message: effect.message || undefined,
      payload: effect.payload as Record<string, unknown> | undefined,
    })),
  };
}

async function readFlowState(response: Response): Promise<DslFlowState> {
  const json = await readProtoJSON(response);
  const state = fromJson(FlowStateSchema, json as ProtoJsonValue);
  return flowStateFromProto(state);
}

export async function startDslFlow(flowId = "fringe.intake.v1"): Promise<DslFlowState> {
  const response = await fetch(`/api/dsl/flows/${encodeURIComponent(flowId)}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  return readFlowState(response);
}

export async function getDslFlow(sessionId: string): Promise<DslFlowState> {
  const response = await fetch(`/api/dsl/flows/${encodeURIComponent(sessionId)}`);
  return readFlowState(response);
}

function interactionEventJson(sessionId: string, event: DslInteractionEvent): ProtoJsonValue {
  const json: Record<string, unknown> = {
    eventId: event.eventId,
    sessionId,
    pageVersion: event.pageVersion,
    nodeId: event.nodeId,
    nodeKind: event.nodeKind,
    actionId: event.actionId,
    event: event.event,
  };
  if (event.value !== undefined) {
    json.value = event.value;
  }
  if (event.meta !== undefined) {
    json.meta = event.meta;
  }
  return json as ProtoJsonValue;
}

export interface DslUploadIntent {
  uploadId: string;
  sessionId?: string;
  purpose?: string;
  slot?: string;
  url: string;
  fieldName?: string;
  accept?: string[];
  maxBytes?: number;
  method?: string;
}

export interface DslUploadedImage {
  uploadId: string;
  sessionId: string;
  purpose: string;
  slot?: string;
  originalFilename?: string;
  contentType?: string;
  sizeBytes: number;
  storageKey: string;
  url: string;
}

export async function postDslUpload(intent: DslUploadIntent, file: File): Promise<DslUploadedImage> {
  const form = new FormData();
  form.append(intent.fieldName || "file", file);
  const response = await fetch(intent.url, {
    method: intent.method || "POST",
    body: form,
  });
  if (!response.ok) {
    let message = `Upload failed with status ${response.status}`;
    try {
      const body = await response.json();
      if (body.message) message = body.message;
    } catch { /* ignore parse error */ }
    throw new DslApiError(message, { status: response.status });
  }
  return response.json();
}

export async function postDslEvent(sessionId: string, event: DslInteractionEvent): Promise<DslFlowState> {
  const protoEvent = fromJson(InteractionEventSchema, interactionEventJson(sessionId, event));
  const response = await fetch(`/api/dsl/flows/${encodeURIComponent(sessionId)}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toJson(InteractionEventSchema, protoEvent)),
  });
  return readFlowState(response);
}
