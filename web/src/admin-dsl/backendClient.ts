import { fromJson, toJson, type JsonValue as ProtoJsonValue } from "@bufbuild/protobuf";
import {
  AdminDslErrorSchema,
  AdminFlowStateSchema,
  AdminInteractionEventSchema,
  type AdminFlowState as ProtoAdminFlowState,
} from "../pb/proto/fringe/admin_dsl/v1/admin_dsl_pb";
import type { AdminPage, AdminJsonValue } from "./schema";

export interface AdminDslFlowState {
  sessionId: string;
  pageVersion: number;
  page: AdminPage;
  effects?: AdminDslEffect[];
}

export interface AdminDslEffect {
  kind: string;
  tone?: string;
  message?: string;
  payload?: Record<string, unknown>;
}

export interface AdminDslInteractionEvent {
  eventId: string;
  pageVersion: number;
  nodeId?: string;
  nodeKind?: string;
  actionId: string;
  event: string;
  value?: AdminJsonValue;
  meta?: Record<string, unknown>;
}

export class AdminDslApiError extends Error {
  readonly code?: string;
  readonly status: number;

  constructor(message: string, options: { code?: string; status: number }) {
    super(message);
    this.name = "AdminDslApiError";
    this.code = options.code;
    this.status = options.status;
  }
}

async function readProtoJSON(response: Response): Promise<unknown> {
  let payload: unknown;
  try {
    payload = await response.json();
  } catch (err) {
    throw new AdminDslApiError(`Admin DSL response was not valid protobuf JSON: ${err instanceof Error ? err.message : String(err)}`, { status: response.status });
  }
  if (!response.ok) {
    try {
      const error = fromJson(AdminDslErrorSchema, payload as ProtoJsonValue);
      throw new AdminDslApiError(error.message || `Admin DSL request failed with status ${response.status}`, { code: error.code || undefined, status: response.status });
    } catch (err) {
      if (err instanceof AdminDslApiError) throw err;
      throw new AdminDslApiError(`Admin DSL request failed with status ${response.status}`, { status: response.status });
    }
  }
  return payload;
}

function flowStateFromProto(state: ProtoAdminFlowState): AdminDslFlowState {
  if (!state.page) throw new AdminDslApiError("Admin DSL flow state did not include a page", { status: 200 });
  return {
    sessionId: state.sessionId,
    pageVersion: state.pageVersion,
    page: state.page as unknown as AdminPage,
    effects: state.effects.map((effect) => ({
      kind: effect.kind,
      tone: effect.tone || undefined,
      message: effect.message || undefined,
      payload: effect.payload as Record<string, unknown> | undefined,
    })),
  };
}

async function readFlowState(response: Response): Promise<AdminDslFlowState> {
  const json = await readProtoJSON(response);
  return flowStateFromProto(fromJson(AdminFlowStateSchema, json as ProtoJsonValue));
}

export async function startAdminDslFlow(flowId = "fringe.admin.services.v1"): Promise<AdminDslFlowState> {
  const response = await fetch(`/api/admin-dsl/flows/${encodeURIComponent(flowId)}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  return readFlowState(response);
}

export async function getAdminDslFlow(sessionId: string): Promise<AdminDslFlowState> {
  const response = await fetch(`/api/admin-dsl/flows/${encodeURIComponent(sessionId)}`);
  return readFlowState(response);
}

function eventJSON(sessionId: string, event: AdminDslInteractionEvent): ProtoJsonValue {
  const json: Record<string, unknown> = {
    eventId: event.eventId,
    sessionId,
    pageVersion: event.pageVersion,
    nodeId: event.nodeId || "",
    nodeKind: event.nodeKind || "",
    actionId: event.actionId,
    event: event.event,
  };
  if (event.value !== undefined) json.value = event.value;
  if (event.meta !== undefined) json.meta = event.meta;
  return json as ProtoJsonValue;
}

export async function postAdminDslEvent(sessionId: string, event: AdminDslInteractionEvent): Promise<AdminDslFlowState> {
  const protoEvent = fromJson(AdminInteractionEventSchema, eventJSON(sessionId, event));
  const response = await fetch(`/api/admin-dsl/flows/${encodeURIComponent(sessionId)}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toJson(AdminInteractionEventSchema, protoEvent)),
  });
  return readFlowState(response);
}
