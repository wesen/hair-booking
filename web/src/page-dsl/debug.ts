export function dslDebugEnabled() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has("debugDsl") ||
    window.localStorage.getItem("fringe.dsl.debug") === "1";
}

export function dslDomTraceEnabled() {
  if (typeof window === "undefined") return false;
  return dslDebugEnabled() && window.localStorage.getItem("fringe.dsl.traceDom") === "1";
}

export function dslDebug(label: string, payload?: unknown) {
  if (!dslDebugEnabled()) return;
  console.log(`[dsl] ${label}`, payload);
}

export function dslMeasure<T>(name: string, fn: () => T): T {
  if (typeof performance === "undefined" || !dslDebugEnabled()) return fn();
  const start = `${name}:start:${crypto.randomUUID()}`;
  const end = `${name}:end:${crypto.randomUUID()}`;
  performance.mark(start);
  try {
    return fn();
  } finally {
    performance.mark(end);
    performance.measure(name, start, end);
  }
}
