/**
 * Decision Tree DSL Parser
 * Parses and validates YAML-based decision tree configurations
 */

import * as yaml from "js-yaml";
import { DecisionTreeDSL, DecisionTreeNode, DecisionTreeOption, DecisionTreeRule } from "@shared/types";

export class DSLParseError extends Error {
  constructor(message: string, public line?: number, public column?: number) {
    super(message);
    this.name = "DSLParseError";
  }
}

/**
 * Parse YAML DSL content into structured decision tree
 */
export function parseDSL(yamlContent: string): DecisionTreeDSL {
  try {
    const parsed = yaml.load(yamlContent) as any;
    
    // Validate required fields
    if (!parsed.name) {
      throw new DSLParseError("Missing required field: name");
    }
    if (!parsed.root) {
      throw new DSLParseError("Missing required field: root");
    }
    if (!parsed.nodes || typeof parsed.nodes !== "object") {
      throw new DSLParseError("Missing or invalid required field: nodes");
    }
    
    // Validate root node exists
    if (!parsed.nodes[parsed.root]) {
      throw new DSLParseError(`Root node "${parsed.root}" not found in nodes`);
    }
    
    // Validate each node
    for (const [nodeId, node] of Object.entries(parsed.nodes)) {
      validateNode(nodeId, node as DecisionTreeNode, parsed.nodes);
    }
    
    return parsed as DecisionTreeDSL;
  } catch (error) {
    if (error instanceof DSLParseError) {
      throw error;
    }
    throw new DSLParseError(`Failed to parse DSL: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Validate a single node structure
 */
function validateNode(nodeId: string, node: DecisionTreeNode, allNodes: Record<string, DecisionTreeNode>): void {
  if (node.type === "terminal") {
    // Terminal nodes don't need options
    return;
  }
  
  if (!node.question) {
    throw new DSLParseError(`Node "${nodeId}" missing required field: question`);
  }
  
  if (!Array.isArray(node.options) || node.options.length === 0) {
    throw new DSLParseError(`Node "${nodeId}" must have at least one option`);
  }
  
  // Validate each option
  for (let i = 0; i < node.options.length; i++) {
    const option = node.options[i];
    if (!option || typeof option !== "object") {
      throw new DSLParseError(`Node "${nodeId}" option ${i} is invalid`);
    }
    if (!option.label) {
      throw new DSLParseError(`Node "${nodeId}" option ${i} missing required field: label`);
    }
    
    // Validate next node reference if present
    if (option.next && !allNodes[option.next]) {
      throw new DSLParseError(`Node "${nodeId}" option "${option.label}" references non-existent node: ${option.next}`);
    }
  }
}



/**
 * Validate DSL and return list of errors
 */
export function validateDSL(yamlContent: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  try {
    parseDSL(yamlContent);
    return { valid: true, errors: [] };
  } catch (error) {
    if (error instanceof DSLParseError) {
      errors.push(error.message);
    } else {
      errors.push(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
    }
    return { valid: false, errors };
  }
}
