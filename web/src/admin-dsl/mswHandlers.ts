import { http, HttpResponse } from "msw";
import { nextServicesScenarioState, servicesScenarioPage, type ServicesScenarioState } from "./scenarioFixtures";

export const adminDslMswHandlers = [
  http.get("/api/admin-dsl/scenarios/services", ({ request }) => {
    const url = new URL(request.url);
    const state = (url.searchParams.get("state") || "idle") as ServicesScenarioState;
    return HttpResponse.json({ state, page: servicesScenarioPage(state), effects: [] });
  }),
  http.post("/api/admin-dsl/scenarios/services/events", async ({ request }) => {
    const body = await request.json() as { state?: ServicesScenarioState; action?: { target?: string }; failSave?: boolean; latencyMs?: number };
    if (body.latencyMs) await new Promise((resolve) => setTimeout(resolve, body.latencyMs));
    const target = body.action?.target || "service.select";
    const state = target === "service.save.pending" ? "saving" : nextServicesScenarioState(target, { failSave: body.failSave });
    return HttpResponse.json({
      state,
      page: servicesScenarioPage(state),
      effects: [{ kind: "toast", tone: state === "error" ? "danger" : "success", message: `MSW handled ${target}` }],
    });
  }),
];
