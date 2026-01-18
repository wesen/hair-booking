import { describe, expect, it } from "vitest";
import {
  parseDuration,
  hasCutService,
  calculateOptionPrice,
  calculateOptionDuration,
  initializeState,
  selectOption,
  isTerminalNode,
  formatPrice,
  formatDuration,
} from "./decision-engine";
import type { DecisionTreeDSL, DecisionTreeState, DecisionTreeOption } from "@shared/types";

describe("Decision Engine", () => {
  describe("parseDuration", () => {
    it("should parse minutes only", () => {
      expect(parseDuration("45min").minutes).toBe(45);
      expect(parseDuration("30min").minutes).toBe(30);
    });

    it("should parse hours only", () => {
      expect(parseDuration("1hr").minutes).toBe(60);
      expect(parseDuration("2hr").minutes).toBe(120);
    });

    it("should parse hours and minutes", () => {
      expect(parseDuration("1hr 30min").minutes).toBe(90);
      expect(parseDuration("2hr 15min").minutes).toBe(135);
    });

    it("should handle case insensitive", () => {
      expect(parseDuration("1HR 30MIN").minutes).toBe(90);
    });
  });

  describe("hasCutService", () => {
    it("should return true when service includes 'cut' in question", () => {
      const services = [
        {
          nodeId: "test",
          question: "What type of haircut?",
          selectedOption: { label: "Service" },
          price: 50,
          duration: 30,
        },
      ];
      expect(hasCutService(services)).toBe(true);
    });

    it("should return true when service includes 'cut' in label", () => {
      const services = [
        {
          nodeId: "test",
          question: "Service?",
          selectedOption: { label: "Men's Cut" },
          price: 50,
          duration: 30,
        },
      ];
      expect(hasCutService(services)).toBe(true);
    });

    it("should return false when no cut service", () => {
      const services = [
        {
          nodeId: "test",
          question: "Color service?",
          selectedOption: { label: "Highlights" },
          price: 100,
          duration: 60,
        },
      ];
      expect(hasCutService(services)).toBe(false);
    });

    it("should return false for empty services", () => {
      expect(hasCutService([])).toBe(false);
    });
  });

  describe("calculateOptionPrice", () => {
    it("should return regular price when no cut service", () => {
      const option: DecisionTreeOption = {
        label: "Highlights",
        price: 120,
        price_with_cut: 155,
      };
      const state: DecisionTreeState = {
        currentNodeId: "test",
        selectedServices: [],
        totalPrice: 0,
        totalDuration: 0,
        appliedRules: [],
      };
      expect(calculateOptionPrice(option, state)).toBe(120);
    });

    it("should return price_with_cut when cut service exists", () => {
      const option: DecisionTreeOption = {
        label: "Highlights",
        price: 120,
        price_with_cut: 155,
      };
      const state: DecisionTreeState = {
        currentNodeId: "test",
        selectedServices: [
          {
            nodeId: "cut",
            question: "Haircut?",
            selectedOption: { label: "Women's Cut" },
            price: 85,
            duration: 60,
          },
        ],
        totalPrice: 85,
        totalDuration: 60,
        appliedRules: [],
      };
      expect(calculateOptionPrice(option, state)).toBe(155);
    });

    it("should return 0 when no price defined", () => {
      const option: DecisionTreeOption = {
        label: "No service",
      };
      const state: DecisionTreeState = {
        currentNodeId: "test",
        selectedServices: [],
        totalPrice: 0,
        totalDuration: 0,
        appliedRules: [],
      };
      expect(calculateOptionPrice(option, state)).toBe(0);
    });
  });

  describe("calculateOptionDuration", () => {
    it("should use books_for if present", () => {
      const option: DecisionTreeOption = {
        label: "Service",
        books_for: "90min",
        duration: "60min",
      };
      expect(calculateOptionDuration(option)).toBe(90);
    });

    it("should use duration if books_for not present", () => {
      const option: DecisionTreeOption = {
        label: "Service",
        duration: "45min",
      };
      expect(calculateOptionDuration(option)).toBe(45);
    });

    it("should return 0 if neither present", () => {
      const option: DecisionTreeOption = {
        label: "Service",
      };
      expect(calculateOptionDuration(option)).toBe(0);
    });
  });

  describe("initializeState", () => {
    it("should create initial state with root node", () => {
      const dsl: DecisionTreeDSL = {
        name: "Test",
        root: "start",
        nodes: {
          start: {
            question: "Test?",
            options: [{ label: "A" }],
          },
        },
      };
      const state = initializeState(dsl);
      
      expect(state.currentNodeId).toBe("start");
      expect(state.selectedServices).toEqual([]);
      expect(state.totalPrice).toBe(0);
      expect(state.totalDuration).toBe(0);
      expect(state.appliedRules).toEqual([]);
    });
  });

  describe("selectOption", () => {
    it("should update state with selected option", () => {
      const dsl: DecisionTreeDSL = {
        name: "Test",
        root: "start",
        nodes: {
          start: {
            question: "Select service",
            options: [
              { label: "Service A", price: 50, duration: "30min", next: "end" },
            ],
          },
          end: {
            type: "terminal",
            question: "",
            options: [],
          },
        },
      };
      const state = initializeState(dsl);
      const option = dsl.nodes.start.options[0];
      
      const newState = selectOption(dsl, state, option);
      
      expect(newState.selectedServices).toHaveLength(1);
      expect(newState.selectedServices[0].selectedOption.label).toBe("Service A");
      expect(newState.totalPrice).toBe(50);
      expect(newState.totalDuration).toBe(30);
      expect(newState.currentNodeId).toBe("end");
    });

    it("should accumulate multiple selections", () => {
      const dsl: DecisionTreeDSL = {
        name: "Test",
        root: "cut",
        nodes: {
          cut: {
            question: "Haircut?",
            options: [{ label: "Cut", price: 55, duration: "45min", next: "color" }],
          },
          color: {
            question: "Color?",
            options: [{ label: "Color", price: 95, duration: "90min", next: "end" }],
          },
          end: {
            type: "terminal",
            question: "",
            options: [],
          },
        },
      };
      
      let state = initializeState(dsl);
      state = selectOption(dsl, state, dsl.nodes.cut.options[0]);
      state = selectOption(dsl, state, dsl.nodes.color.options[0]);
      
      expect(state.selectedServices).toHaveLength(2);
      expect(state.totalPrice).toBe(150);
      expect(state.totalDuration).toBe(135);
    });
  });

  describe("isTerminalNode", () => {
    it("should return true for terminal node", () => {
      const dsl: DecisionTreeDSL = {
        name: "Test",
        root: "start",
        nodes: {
          start: {
            question: "Test",
            options: [{ label: "A" }],
          },
          end: {
            type: "terminal",
            question: "",
            options: [],
          },
        },
      };
      expect(isTerminalNode(dsl, "end")).toBe(true);
    });

    it("should return false for non-terminal node", () => {
      const dsl: DecisionTreeDSL = {
        name: "Test",
        root: "start",
        nodes: {
          start: {
            question: "Test",
            options: [{ label: "A" }],
          },
        },
      };
      expect(isTerminalNode(dsl, "start")).toBe(false);
    });
  });

  describe("formatPrice", () => {
    it("should format cents to dollars", () => {
      expect(formatPrice(5500)).toBe("$55.00");
      expect(formatPrice(12050)).toBe("$120.50");
      expect(formatPrice(0)).toBe("$0.00");
    });
  });

  describe("formatDuration", () => {
    it("should format minutes only", () => {
      expect(formatDuration(30)).toBe("30min");
      expect(formatDuration(45)).toBe("45min");
    });

    it("should format hours only", () => {
      expect(formatDuration(60)).toBe("1hr");
      expect(formatDuration(120)).toBe("2hr");
    });

    it("should format hours and minutes", () => {
      expect(formatDuration(90)).toBe("1hr 30min");
      expect(formatDuration(135)).toBe("2hr 15min");
    });
  });
});
