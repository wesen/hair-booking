/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

/**
 * Decision tree DSL types
 */

export interface DecisionTreeOption {
  label: string;
  price?: number;
  /** Price when combined with a cut service */
  price_with_cut?: number;
  duration?: string;
  /** Duration in minutes when this option books time */
  books_for?: string;
  note?: string;
  /** Next node ID to navigate to */
  next?: string;
}

export interface DecisionTreeNode {
  question: string;
  /** Whether this node allows multiple selections */
  optional?: boolean;
  options: DecisionTreeOption[];
  type?: "terminal";
  action?: string;
}

export interface DecisionTreeRule {
  if_service_includes?: string[];
  if_service?: string;
  duration?: string;
  then: string;
}

export interface DecisionTreeDSL {
  name: string;
  root: string;
  nodes: Record<string, DecisionTreeNode>;
  rules?: DecisionTreeRule[];
}

/**
 * Runtime state during decision tree navigation
 */
export interface DecisionTreeState {
  currentNodeId: string;
  selectedServices: SelectedService[];
  totalPrice: number;
  totalDuration: number;
  appliedRules: string[];
}

export interface SelectedService {
  nodeId: string;
  question: string;
  selectedOption: DecisionTreeOption;
  price: number;
  duration: number;
}

/**
 * Parsed duration result
 */
export interface ParsedDuration {
  minutes: number;
  original: string;
}
