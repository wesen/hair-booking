package dsl

import (
	"fmt"

	"gopkg.in/yaml.v3"
)

// ParseError describes a DSL parsing/validation error.
type ParseError struct {
	Message string
}

func (e *ParseError) Error() string {
	return e.Message
}

// ParseDSL parses and validates a YAML DSL document.
func ParseDSL(content string) (DecisionTreeDSL, error) {
	var parsed DecisionTreeDSL
	if err := yaml.Unmarshal([]byte(content), &parsed); err != nil {
		return DecisionTreeDSL{}, &ParseError{Message: fmt.Sprintf("failed to parse DSL: %s", err.Error())}
	}

	if parsed.Name == "" {
		return DecisionTreeDSL{}, &ParseError{Message: "missing required field: name"}
	}
	if parsed.Root == "" {
		return DecisionTreeDSL{}, &ParseError{Message: "missing required field: root"}
	}
	if parsed.Nodes == nil || len(parsed.Nodes) == 0 {
		return DecisionTreeDSL{}, &ParseError{Message: "missing or invalid required field: nodes"}
	}
	if _, ok := parsed.Nodes[parsed.Root]; !ok {
		return DecisionTreeDSL{}, &ParseError{Message: fmt.Sprintf("root node \"%s\" not found in nodes", parsed.Root)}
	}

	for nodeID, node := range parsed.Nodes {
		if err := validateNode(nodeID, node, parsed.Nodes); err != nil {
			return DecisionTreeDSL{}, err
		}
	}

	return parsed, nil
}

// ValidateDSL parses and returns a validation result for UI consumption.
func ValidateDSL(content string) (bool, []string) {
	_, err := ParseDSL(content)
	if err == nil {
		return true, nil
	}

	return false, []string{err.Error()}
}

func validateNode(nodeID string, node DecisionTreeNode, allNodes map[string]DecisionTreeNode) error {
	if node.Type == "terminal" {
		if node.Action == "" {
			return &ParseError{Message: fmt.Sprintf("node \"%s\" missing required field: action", nodeID)}
		}
		return nil
	}

	if node.Question == "" {
		return &ParseError{Message: fmt.Sprintf("node \"%s\" missing required field: question", nodeID)}
	}
	if len(node.Options) == 0 {
		return &ParseError{Message: fmt.Sprintf("node \"%s\" must have at least one option", nodeID)}
	}

	for i, option := range node.Options {
		if option.Label == "" {
			return &ParseError{Message: fmt.Sprintf("node \"%s\" option %d missing required field: label", nodeID, i)}
		}
		if option.Next != "" {
			if _, ok := allNodes[option.Next]; !ok {
				return &ParseError{Message: fmt.Sprintf("node \"%s\" option \"%s\" references non-existent node: %s", nodeID, option.Label, option.Next)}
			}
		}
	}

	return nil
}
