import type { AdminActionRef, AdminJsonObject, AdminNode, AdminRenderContext } from "./schema";
import { str } from "./renderUtils";

export function isActionRef(item: unknown): item is AdminActionRef {
  return !!item && typeof item === "object" && !Array.isArray(item) && typeof (item as { type?: unknown }).type === "string";
}

export function actionList(props: AdminJsonObject | undefined): AdminActionRef[] {
  const value = props?.actions;
  if (Array.isArray(value)) return value.filter(isActionRef);
  if (value && typeof value === "object" && !Array.isArray(value)) return Object.values(value).filter(isActionRef);
  return [];
}

export function dispatchAdminAction(
  ctx: AdminRenderContext | undefined,
  node: AdminNode,
  actionRef: AdminActionRef,
  value?: unknown,
  meta?: unknown,
) {
  if (ctx?.dispatch) {
    void ctx.dispatch({
      nodeId: node.meta?.id || str(node.props, "id", ""),
      nodeKind: node.kind,
      action: actionRef,
      value: value as never,
      meta,
    });
    return;
  }
  console.log("Admin DSL action", { node, action: actionRef, value, meta });
}

export function actionKey(actionRef: AdminActionRef, index: number) {
  return `${actionRef.type}:${actionRef.target}:${index}`;
}

export function actionIsPrimary(actionRef: AdminActionRef) {
  return actionRef.type === "mutation" || actionRef.type === "open" || actionRef.priority === "primary" || actionRef.intent === "primary";
}

export function actionIsDanger(actionRef: AdminActionRef) {
  return actionRef.type === "confirm" || actionRef.intent === "danger";
}
