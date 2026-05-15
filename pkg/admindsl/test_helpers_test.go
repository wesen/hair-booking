package admindsl

import "testing"

func firstActionID(t *testing.T, page Page, target string) string {
	t.Helper()
	var walk func(nodes []Node) string
	walk = func(nodes []Node) string {
		for _, node := range nodes {
			if id := actionIDFromProps(node.Props["actions"], target); id != "" {
				return id
			}
			if id := walk(node.Children); id != "" {
				return id
			}
		}
		return ""
	}
	if id := walk(page.Nodes); id != "" {
		return id
	}
	if id := walk(page.Drawers); id != "" {
		return id
	}
	if id := walk(page.Modals); id != "" {
		return id
	}
	t.Fatalf("action target %q not found", target)
	return ""
}

func actionIDFromProps(value any, target string) string {
	switch actions := value.(type) {
	case []any:
		for _, item := range actions {
			if id := actionIDFromProps(item, target); id != "" {
				return id
			}
		}
	case map[string]any:
		if actions["target"] == target {
			id, _ := actions["id"].(string)
			return id
		}
		for _, item := range actions {
			if id := actionIDFromProps(item, target); id != "" {
				return id
			}
		}
	}
	return ""
}
