/**
 * Decision Tree Execution Engine
 * Handles navigation, pricing calculation, and rule application
 */

import {
  DecisionTreeDSL,
  DecisionTreeState,
  SelectedService,
  DecisionTreeOption,
  ParsedDuration,
} from "@shared/types";

/**
 * Parse duration string to minutes
 * Supports formats: "45min", "1hr", "1hr 30min", "90min"
 */
export function parseDuration(duration: string): ParsedDuration {
  const original = duration;
  let minutes = 0;
  
  // Match hours
  const hrMatch = duration.match(/(\d+)\s*hr/i);
  if (hrMatch) {
    minutes += parseInt(hrMatch[1]) * 60;
  }
  
  // Match minutes
  const minMatch = duration.match(/(\d+)\s*min/i);
  if (minMatch) {
    minutes += parseInt(minMatch[1]);
  }
  
  return { minutes, original };
}

/**
 * Check if services include a cut
 */
export function hasCutService(services: SelectedService[]): boolean {
  return services.some(s => 
    s.question.toLowerCase().includes("cut") || 
    s.selectedOption.label.toLowerCase().includes("cut")
  );
}

/**
 * Calculate price for an option based on current state
 */
export function calculateOptionPrice(
  option: DecisionTreeOption,
  state: DecisionTreeState
): number {
  // If option has price_with_cut and user has selected a cut, use that price
  if (option.price_with_cut !== undefined && hasCutService(state.selectedServices)) {
    return option.price_with_cut;
  }
  
  // Otherwise use regular price
  return option.price || 0;
}

/**
 * Calculate duration for an option
 */
export function calculateOptionDuration(option: DecisionTreeOption): number {
  if (option.books_for) {
    return parseDuration(option.books_for).minutes;
  }
  if (option.duration) {
    return parseDuration(option.duration).minutes;
  }
  return 0;
}

/**
 * Apply combo pricing rules to the current state
 */
export function applyComboRules(
  dsl: DecisionTreeDSL,
  state: DecisionTreeState
): DecisionTreeState {
  if (!dsl.rules || dsl.rules.length === 0) {
    return state;
  }
  
  const newState = { ...state };
  const appliedRules: string[] = [];
  
  for (const rule of dsl.rules) {
    // Check if rule conditions are met
    if (rule.if_service_includes) {
      const hasAllServices = rule.if_service_includes.every(serviceName =>
        state.selectedServices.some(s =>
          s.selectedOption.label.toLowerCase().includes(serviceName.toLowerCase()) ||
          s.question.toLowerCase().includes(serviceName.toLowerCase())
        )
      );
      
      if (hasAllServices && rule.then === "apply_combo_pricing") {
        appliedRules.push(`Combo discount: ${rule.if_service_includes.join(" + ")}`);
        // Combo pricing is already handled by price_with_cut in calculateOptionPrice
      }
    }
    
    if (rule.if_service) {
      const hasService = state.selectedServices.some(s =>
        s.selectedOption.label.toLowerCase().includes(rule.if_service!.toLowerCase())
      );
      
      if (hasService) {
        if (rule.then === "apply_cut_discount") {
          appliedRules.push(`Cut discount applied for ${rule.if_service}`);
        }
        
        // Apply duration from rule if specified
        if (rule.duration) {
          const additionalDuration = parseDuration(rule.duration).minutes;
          newState.totalDuration += additionalDuration;
        }
      }
    }
  }
  
  newState.appliedRules = [...state.appliedRules, ...appliedRules];
  return newState;
}

/**
 * Initialize a new decision tree state
 */
export function initializeState(dsl: DecisionTreeDSL): DecisionTreeState {
  return {
    currentNodeId: dsl.root,
    selectedServices: [],
    totalPrice: 0,
    totalDuration: 0,
    appliedRules: [],
  };
}

/**
 * Process a user's option selection and advance state
 */
export function selectOption(
  dsl: DecisionTreeDSL,
  state: DecisionTreeState,
  option: DecisionTreeOption
): DecisionTreeState {
  const currentNode = dsl.nodes[state.currentNodeId];
  if (!currentNode) {
    throw new Error(`Invalid state: node ${state.currentNodeId} not found`);
  }
  
  // Calculate price and duration for this selection
  const price = calculateOptionPrice(option, state);
  const duration = calculateOptionDuration(option);
  
  // Create selected service record
  const selectedService: SelectedService = {
    nodeId: state.currentNodeId,
    question: currentNode.question,
    selectedOption: option,
    price,
    duration,
  };
  
  // Update state
  let newState: DecisionTreeState = {
    currentNodeId: option.next || state.currentNodeId,
    selectedServices: [...state.selectedServices, selectedService],
    totalPrice: state.totalPrice + price,
    totalDuration: state.totalDuration + duration,
    appliedRules: state.appliedRules,
  };
  
  // Apply combo pricing rules
  newState = applyComboRules(dsl, newState);
  
  return newState;
}

/**
 * Check if current node is terminal
 */
export function isTerminalNode(dsl: DecisionTreeDSL, nodeId: string): boolean {
  const node = dsl.nodes[nodeId];
  return node?.type === "terminal";
}

/**
 * Get current node from state
 */
export function getCurrentNode(dsl: DecisionTreeDSL, state: DecisionTreeState) {
  return dsl.nodes[state.currentNodeId];
}

/**
 * Format price for display (cents to dollars)
 */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Format duration for display
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}hr`;
  }
  return `${hours}hr ${mins}min`;
}
