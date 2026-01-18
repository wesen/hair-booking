package dsl

import (
	"fmt"
	"regexp"

	"gopkg.in/yaml.v3"
)

// ParseError describes a DSL parsing/validation error.
type ParseError struct {
	Message string
}

func (e *ParseError) Error() string {
	return e.Message
}

// ValidationIssue captures a structured validation problem.
type ValidationIssue struct {
	Code        string `json:"code"`
	Message     string `json:"message"`
	NodeID      string `json:"nodeId,omitempty"`
	OptionLabel string `json:"optionLabel,omitempty"`
	Line        int    `json:"line,omitempty"`
	Column      int    `json:"column,omitempty"`
}

// ParseDSL parses and validates a YAML DSL document.
func ParseDSL(content string) (DecisionTreeDSL, error) {
	var parsed DecisionTreeDSL
	if err := yaml.Unmarshal([]byte(content), &parsed); err != nil {
		line, _ := parseYAMLErrorLocation(err.Error())
		return DecisionTreeDSL{}, &ParseError{Message: fmt.Sprintf("failed to parse DSL: %s (line %d)", err.Error(), line)}
	}

	issues := validateTree(parsed)
	if len(issues) > 0 {
		issue := issues[0]
		return DecisionTreeDSL{}, &ParseError{Message: issue.Message}
	}

	return parsed, nil
}

// ValidateDSL parses and returns a validation result for UI consumption.
func ValidateDSL(content string) (bool, []string) {
	valid, issues := ValidateDSLWithIssues(content)
	if valid {
		return true, nil
	}
	messages := make([]string, 0, len(issues))
	for _, issue := range issues {
		messages = append(messages, issue.Message)
	}
	return false, messages
}

// ValidateDSLWithIssues returns structured validation issues for UI and API consumers.
func ValidateDSLWithIssues(content string) (bool, []ValidationIssue) {
	var parsed DecisionTreeDSL
	if err := yaml.Unmarshal([]byte(content), &parsed); err != nil {
		line, column := parseYAMLErrorLocation(err.Error())
		return false, []ValidationIssue{{
			Code:    "YAML_PARSE_ERROR",
			Message: fmt.Sprintf("failed to parse DSL: %s", err.Error()),
			Line:    line,
			Column:  column,
		}}
	}

	issues := validateTree(parsed)
	return len(issues) == 0, issues
}

func validateTree(tree DecisionTreeDSL) []ValidationIssue {
	var issues []ValidationIssue

	if tree.Name == "" {
		issues = append(issues, ValidationIssue{Code: "NAME_REQUIRED", Message: "missing required field: name"})
	}
	if tree.Root == "" {
		issues = append(issues, ValidationIssue{Code: "ROOT_REQUIRED", Message: "missing required field: root"})
	}
	if tree.Nodes == nil || len(tree.Nodes) == 0 {
		issues = append(issues, ValidationIssue{Code: "NODES_REQUIRED", Message: "missing or invalid required field: nodes"})
		return issues
	}
	if tree.Root != "" {
		if _, ok := tree.Nodes[tree.Root]; !ok {
			issues = append(issues, ValidationIssue{
				Code:    "ROOT_NOT_FOUND",
				Message: fmt.Sprintf("root node \"%s\" not found in nodes", tree.Root),
			})
		}
	}

	for nodeID, node := range tree.Nodes {
		issues = append(issues, validateNode(nodeID, node, tree.Nodes)...)
	}

	return issues
}

func validateNode(nodeID string, node DecisionTreeNode, allNodes map[string]DecisionTreeNode) []ValidationIssue {
	var issues []ValidationIssue
	if node.Type == "terminal" {
		if node.Action == "" {
			issues = append(issues, ValidationIssue{
				Code:    "TERMINAL_ACTION_REQUIRED",
				Message: fmt.Sprintf("node \"%s\" missing required field: action", nodeID),
				NodeID:  nodeID,
			})
		}
		return issues
	}

	if node.Question == "" {
		issues = append(issues, ValidationIssue{
			Code:    "QUESTION_REQUIRED",
			Message: fmt.Sprintf("node \"%s\" missing required field: question", nodeID),
			NodeID:  nodeID,
		})
	}
	if len(node.Options) == 0 {
		issues = append(issues, ValidationIssue{
			Code:    "OPTIONS_REQUIRED",
			Message: fmt.Sprintf("node \"%s\" must have at least one option", nodeID),
			NodeID:  nodeID,
		})
	}

	for i, option := range node.Options {
		if option.Label == "" {
			issues = append(issues, ValidationIssue{
				Code:    "OPTION_LABEL_REQUIRED",
				Message: fmt.Sprintf("node \"%s\" option %d missing required field: label", nodeID, i),
				NodeID:  nodeID,
			})
		}
		if option.Next != "" {
			if _, ok := allNodes[option.Next]; !ok {
				issues = append(issues, ValidationIssue{
					Code:        "OPTION_NEXT_NOT_FOUND",
					Message:     fmt.Sprintf("node \"%s\" option \"%s\" references non-existent node: %s", nodeID, option.Label, option.Next),
					NodeID:      nodeID,
					OptionLabel: option.Label,
				})
			}
		}
	}

	return issues
}

var yamlLineRegex = regexp.MustCompile(`line (\\d+)(?:, column (\\d+))?`)

func parseYAMLErrorLocation(message string) (int, int) {
	match := yamlLineRegex.FindStringSubmatch(message)
	if len(match) == 0 {
		return 0, 0
	}
	line := atoiSafe(match[1])
	column := 0
	if len(match) > 2 && match[2] != "" {
		column = atoiSafe(match[2])
	}
	return line, column
}

func atoiSafe(value string) int {
	result := 0
	for _, char := range value {
		if char < '0' || char > '9' {
			continue
		}
		result = result*10 + int(char-'0')
	}
	return result
}
