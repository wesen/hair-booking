package runner

import (
	"context"
	"fmt"
	"strings"

	"github.com/go-go-golems/XXX/internal/sbcap/config"
	"github.com/go-go-golems/XXX/internal/sbcap/modes"
)

type ModeResult struct {
	Mode    string
	Status  string
	Message string
}

type RunResult struct {
	Results []ModeResult
}

var defaultModes = []string{"capture", "cssdiff"}

func NormalizeModes(raw string) ([]string, error) {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return defaultModes, nil
	}
	parts := strings.Split(raw, ",")
	var modesOut []string
	seen := map[string]bool{}
	for _, p := range parts {
		m := strings.TrimSpace(p)
		if m == "" {
			continue
		}
		if m == "full" {
			for _, fullMode := range []string{"capture", "cssdiff", "matched-styles", "ai-review"} {
				if !seen[fullMode] {
					modesOut = append(modesOut, fullMode)
					seen[fullMode] = true
				}
			}
			continue
		}
		if !seen[m] {
			modesOut = append(modesOut, m)
			seen[m] = true
		}
	}
	if len(modesOut) == 0 {
		return nil, fmt.Errorf("no modes provided")
	}
	return modesOut, nil
}

func Run(ctx context.Context, cfg *config.Config, modesList []string, dryRun bool) (RunResult, error) {
	results := RunResult{}
	if dryRun {
		for _, m := range modesList {
			results.Results = append(results.Results, ModeResult{Mode: m, Status: "skipped", Message: "dry-run"})
		}
		return results, nil
	}

	for _, mode := range modesList {
		var err error
		switch mode {
		case "capture":
			err = modes.Capture(ctx, cfg)
		case "cssdiff":
			err = modes.CSSDiff(ctx, cfg)
		case "matched-styles":
			err = modes.MatchedStyles(ctx, cfg)
		case "ai-review":
			err = modes.AIReview(ctx, cfg)
		default:
			err = fmt.Errorf("unknown mode: %s", mode)
		}
		if err != nil {
			results.Results = append(results.Results, ModeResult{Mode: mode, Status: "error", Message: err.Error()})
			return results, err
		}
		results.Results = append(results.Results, ModeResult{Mode: mode, Status: "ok", Message: "completed"})
	}

	return results, nil
}
