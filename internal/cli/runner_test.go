package cli

import (
	"testing"

	"github.com/go-go-golems/XXX/internal/dsl"
)

const simpleTree = `name: Simple
root: cuts
nodes:
  cuts:
    question: "Pick a cut"
    options:
      - label: "Men's Cut"
        price: 5500
        duration: 45min
        next: end
      - label: "Women's Cut"
        price: 8500
        duration: 1hr
        next: end
  end:
    type: terminal
    action: book_appointment
`

func TestRunSelections(t *testing.T) {
	tree, err := dsl.ParseDSL(simpleTree)
	if err != nil {
		t.Fatalf("parse failed: %v", err)
	}

	state, err := RunSelections(tree, []string{"Men's Cut"})
	if err != nil {
		t.Fatalf("run failed: %v", err)
	}

	if state.TotalPrice != 5500 {
		t.Fatalf("expected price 5500, got %d", state.TotalPrice)
	}
	if state.TotalDuration != 45 {
		t.Fatalf("expected duration 45, got %d", state.TotalDuration)
	}
	if state.CurrentNodeID != "end" {
		t.Fatalf("expected end node, got %s", state.CurrentNodeID)
	}
}
