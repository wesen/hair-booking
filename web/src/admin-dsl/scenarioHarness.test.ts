import { describe, expect, it } from "vitest";
import { responseForAdminScenario } from "./scenarioHarness";
import { servicesScenarioDefinition } from "./scenarioFixtures";

describe("admin DSL scenario harness", () => {
  it("maps action targets to declarative scenario transitions", () => {
    const result = responseForAdminScenario(servicesScenarioDefinition, "idle", { target: "service.select" });
    expect(result.state).toBe("selected");
    expect(result.page.drawers).toHaveLength(1);
    expect(result.effects[0]).toEqual(expect.objectContaining({ tone: "success" }));
  });

  it("supports validation, authorization, and stale response semantics", () => {
    const validation = responseForAdminScenario(servicesScenarioDefinition, "selected", { target: "service.save.validation" });
    expect(validation.state).toBe("error");
    expect(validation.error).toEqual(expect.objectContaining({ code: "admin_dsl_validation" }));

    const authorization = responseForAdminScenario(servicesScenarioDefinition, "idle", { target: "service.permission" });
    expect(authorization.state).toBe("permission");
    expect(authorization.error).toEqual(expect.objectContaining({ code: "admin_dsl_authorization" }));

    const stale = responseForAdminScenario(servicesScenarioDefinition, "selected", { target: "service.stale" });
    expect(stale.state).toBe("stale");
    expect(stale.effects[0]).toEqual(expect.objectContaining({ tone: "info" }));
  });
});
