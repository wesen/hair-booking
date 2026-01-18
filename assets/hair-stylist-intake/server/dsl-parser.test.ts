import { describe, expect, it } from "vitest";
import { parseDSL, validateDSL, DSLParseError } from "./dsl-parser";

describe("DSL Parser", () => {
  it("should parse valid DSL with basic structure", () => {
    const dsl = `name: Test Tree
root: start

nodes:
  start:
    question: "What service?"
    options:
      - label: "Service A"
        price: 50
        next: end
  end:
    type: terminal`;

    const result = parseDSL(dsl);
    
    expect(result.name).toBe("Test Tree");
    expect(result.root).toBe("start");
    expect(result.nodes.start).toBeDefined();
    expect(result.nodes.start.question).toBe("What service?");
    expect(result.nodes.start.options).toHaveLength(1);
    expect(result.nodes.start.options[0].label).toBe("Service A");
    expect(result.nodes.start.options[0].price).toBe(50);
  });

  it("should parse DSL with multiple options and pricing", () => {
    const dsl = `name: Haircuts
root: cuts

nodes:
  cuts:
    question: "Select cut type"
    options:
      - label: "Men's Cut"
        price: 55
        duration: 45min
        next: end
      - label: "Women's Cut"
        price: 85
        duration: 1hr
        next: end
  end:
    type: terminal`;

    const result = parseDSL(dsl);
    
    expect(result.nodes.cuts.options).toHaveLength(2);
    expect(result.nodes.cuts.options[0].price).toBe(55);
    expect(result.nodes.cuts.options[0].duration).toBe("45min");
    expect(result.nodes.cuts.options[1].price).toBe(85);
  });

  it("should parse DSL with price_with_cut", () => {
    const dsl = `name: Color Services
root: color

nodes:
  color:
    question: "Color service?"
    options:
      - label: "Highlights"
        price: 120
        price_with_cut: 155
        next: end
  end:
    type: terminal`;

    const result = parseDSL(dsl);
    
    expect(result.nodes.color.options[0].price).toBe(120);
    expect(result.nodes.color.options[0].price_with_cut).toBe(155);
  });

  it("should parse DSL with rules", () => {
    const dsl = `name: Services
root: start

nodes:
  start:
    question: "Service?"
    options:
      - label: "Cut"
        next: end
  end:
    type: terminal

rules:
  - if_service_includes: [cut, color]
    then: apply_combo_pricing`;

    const result = parseDSL(dsl);
    
    expect(result.rules).toBeDefined();
    expect(result.rules).toHaveLength(1);
    expect(result.rules![0].if_service_includes).toEqual(["cut", "color"]);
    expect(result.rules![0].then).toBe("apply_combo_pricing");
  });

  it("should throw error for missing name", () => {
    const dsl = `root: start

nodes:
  start:
    question: "Test"
    options:
      - label: "A"`;

    expect(() => parseDSL(dsl)).toThrow(DSLParseError);
    expect(() => parseDSL(dsl)).toThrow("Missing required field: name");
  });

  it("should throw error for missing root", () => {
    const dsl = `name: Test

nodes:
  start:
    question: "Test"
    options:
      - label: "A"`;

    expect(() => parseDSL(dsl)).toThrow(DSLParseError);
    expect(() => parseDSL(dsl)).toThrow("Missing required field: root");
  });

  it("should throw error for missing nodes", () => {
    const dsl = `name: Test
root: start`;

    expect(() => parseDSL(dsl)).toThrow(DSLParseError);
    expect(() => parseDSL(dsl)).toThrow("Missing or invalid required field: nodes");
  });

  it("should throw error when root node doesn't exist", () => {
    const dsl = `name: Test
root: nonexistent

nodes:
  start:
    question: "Test"
    options:
      - label: "A"`;

    expect(() => parseDSL(dsl)).toThrow(DSLParseError);
    expect(() => parseDSL(dsl)).toThrow('Root node "nonexistent" not found in nodes');
  });

  it("should throw error for node without question", () => {
    const dsl = `name: Test
root: start

nodes:
  start:
    options:
      - label: "A"`;

    expect(() => parseDSL(dsl)).toThrow(DSLParseError);
    expect(() => parseDSL(dsl)).toThrow('missing required field: question');
  });

  it("should throw error for node without options", () => {
    const dsl = `name: Test
root: start

nodes:
  start:
    question: "Test"`;

    expect(() => parseDSL(dsl)).toThrow(DSLParseError);
    expect(() => parseDSL(dsl)).toThrow("must have at least one option");
  });

  it("should throw error for option without label", () => {
    const dsl = `name: Test
root: start

nodes:
  start:
    question: "Test"
    options:
      - price: 50`;

    expect(() => parseDSL(dsl)).toThrow(DSLParseError);
    expect(() => parseDSL(dsl)).toThrow("missing required field: label");
  });

  it("should throw error for invalid next node reference", () => {
    const dsl = `name: Test
root: start

nodes:
  start:
    question: "Test"
    options:
      - label: "A"
        next: nonexistent`;

    expect(() => parseDSL(dsl)).toThrow(DSLParseError);
    expect(() => parseDSL(dsl)).toThrow("references non-existent node: nonexistent");
  });

  it("should allow terminal nodes without options", () => {
    const dsl = `name: Test
root: start

nodes:
  start:
    question: "Test"
    options:
      - label: "A"
        next: end
  end:
    type: terminal`;

    expect(() => parseDSL(dsl)).not.toThrow();
  });

  it("validateDSL should return valid for correct DSL", () => {
    const dsl = `name: Test
root: start

nodes:
  start:
    question: "Test"
    options:
      - label: "A"
        next: end
  end:
    type: terminal`;

    const result = validateDSL(dsl);
    
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("validateDSL should return errors for invalid DSL", () => {
    const dsl = `name: Test
root: nonexistent

nodes:
  start:
    question: "Test"
    options:
      - label: "A"`;

    const result = validateDSL(dsl);
    
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
