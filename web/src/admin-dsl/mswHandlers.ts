import { createAdminScenarioHandlers } from "./scenarioHarness";
import { servicesScenarioDefinition } from "./scenarioFixtures";

export const adminDslMswHandlers = [
  ...createAdminScenarioHandlers(servicesScenarioDefinition),
];
