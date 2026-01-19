package modes

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/chromedp/cdproto/cdp"
	"github.com/chromedp/cdproto/css"
	"github.com/chromedp/cdproto/dom"
	"github.com/chromedp/chromedp"
	"github.com/go-go-golems/XXX/internal/sbcap/config"
	"github.com/go-go-golems/XXX/internal/sbcap/driver"
)

type MatchedStylesResult struct {
	Styles []MatchedStyleEntry `json:"styles"`
}

type MatchedStyleEntry struct {
	Name     string          `json:"name"`
	Selector string          `json:"selector"`
	Original MatchedSnapshot `json:"original"`
	React    MatchedSnapshot `json:"react"`
	Winners  []WinnerDiff    `json:"winners"`
}

type MatchedSnapshot struct {
	Exists   bool              `json:"exists"`
	Rules    []MatchedRule     `json:"rules"`
	Computed map[string]string `json:"computed"`
	Bounds   *Bounds           `json:"bounds,omitempty"`
}

type MatchedRule struct {
	Selector   string         `json:"selector"`
	Properties []RuleProperty `json:"properties"`
}

type RuleProperty struct {
	Name      string `json:"name"`
	Value     string `json:"value"`
	Important bool   `json:"important"`
}

type Winner struct {
	Selector  string `json:"selector"`
	Value     string `json:"value"`
	Important bool   `json:"important"`
}

type WinnerDiff struct {
	Property string `json:"property"`
	Original Winner `json:"original"`
	React    Winner `json:"react"`
}

func RunMatchedStyles(ctx context.Context, cfg *config.Config) error {
	if !cfg.Output.WriteJSON && !cfg.Output.WriteMarkdown {
		return nil
	}

	if err := os.MkdirAll(cfg.Output.Dir, 0o755); err != nil {
		return err
	}

	browser, err := driver.NewBrowser(ctx)
	if err != nil {
		return err
	}
	defer browser.Close()

	originalPage, err := browser.NewPage()
	if err != nil {
		return err
	}
	defer originalPage.Close()

	reactPage, err := browser.NewPage()
	if err != nil {
		return err
	}
	defer reactPage.Close()

	if err := originalPage.SetViewport(cfg.Original.Viewport.Width, cfg.Original.Viewport.Height); err != nil {
		return err
	}
	if err := reactPage.SetViewport(cfg.React.Viewport.Width, cfg.React.Viewport.Height); err != nil {
		return err
	}

	if err := originalPage.Goto(cfg.Original.URL); err != nil {
		return err
	}
	if cfg.Original.WaitMS > 0 {
		originalPage.Wait(time.Duration(cfg.Original.WaitMS) * time.Millisecond)
	}

	if err := reactPage.Goto(cfg.React.URL); err != nil {
		return err
	}
	if cfg.React.WaitMS > 0 {
		reactPage.Wait(time.Duration(cfg.React.WaitMS) * time.Millisecond)
	}

	result := MatchedStylesResult{}
	for _, style := range cfg.Styles {
		origSnap, err := evaluateMatched(originalPage, style)
		if err != nil {
			return err
		}
		reactSnap, err := evaluateMatched(reactPage, style)
		if err != nil {
			return err
		}
		winners := buildWinnerDiffs(style.Props, origSnap, reactSnap)
		result.Styles = append(result.Styles, MatchedStyleEntry{
			Name:     style.Name,
			Selector: style.Selector,
			Original: origSnap,
			React:    reactSnap,
			Winners:  winners,
		})
	}

	if cfg.Output.WriteJSON {
		if err := writeJSON(filepath.Join(cfg.Output.Dir, "matched-styles.json"), result); err != nil {
			return err
		}
	}
	if cfg.Output.WriteMarkdown {
		if err := writeMatchedMarkdown(filepath.Join(cfg.Output.Dir, "matched-styles.md"), result); err != nil {
			return err
		}
	}

	return nil
}

func evaluateMatched(page *driver.Page, spec config.StyleSpec) (MatchedSnapshot, error) {
	var nodeIDs []cdp.NodeID
	if err := chromedp.Run(page.Context(), chromedp.NodeIDs(spec.Selector, &nodeIDs, chromedp.ByQuery)); err != nil {
		return MatchedSnapshot{}, err
	}
	if len(nodeIDs) == 0 {
		return MatchedSnapshot{Exists: false, Rules: []MatchedRule{}, Computed: map[string]string{}}, nil
	}
	nodeID := nodeIDs[0]

	_, _, matchedRules, _, _, _, _, _, _, _, _, _, _, _, err := css.GetMatchedStylesForNode(nodeID).Do(page.Context())
	if err != nil {
		return MatchedSnapshot{}, err
	}
	computedProps, err := css.GetComputedStyleForNode(nodeID).Do(page.Context())
	if err != nil {
		return MatchedSnapshot{}, err
	}

	computedMap := map[string]string{}
	for _, prop := range computedProps {
		computedMap[prop.Name] = prop.Value
	}

	var bounds *Bounds
	if hasReport(spec.Report, "box_model") {
		box, err := dom.GetBoxModel().WithNodeID(nodeID).Do(page.Context())
		if err == nil && box != nil {
			bounds = boxModelBounds(box)
		}
	}

	rules := []MatchedRule{}
	for _, ruleMatch := range matchedRules {
		selector := ""
		if ruleMatch.Rule != nil && ruleMatch.Rule.SelectorList != nil {
			selector = ruleMatch.Rule.SelectorList.Text
		}
		props := []RuleProperty{}
		if ruleMatch.Rule != nil && ruleMatch.Rule.Style != nil {
			for _, prop := range ruleMatch.Rule.Style.CSSProperties {
				props = append(props, RuleProperty{
					Name:      prop.Name,
					Value:     prop.Value,
					Important: prop.Important,
				})
			}
		}
		rules = append(rules, MatchedRule{Selector: selector, Properties: props})
	}

	return MatchedSnapshot{Exists: true, Rules: rules, Computed: computedMap, Bounds: bounds}, nil
}

func buildWinnerDiffs(props []string, orig MatchedSnapshot, react MatchedSnapshot) []WinnerDiff {
	var diffs []WinnerDiff
	for _, prop := range props {
		origWinner := findWinner(orig.Rules, prop)
		reactWinner := findWinner(react.Rules, prop)
		diffs = append(diffs, WinnerDiff{Property: prop, Original: origWinner, React: reactWinner})
	}
	return diffs
}

func findWinner(rules []MatchedRule, prop string) Winner {
	var winner Winner
	var winnerSet bool
	var winnerImportant bool
	for _, rule := range rules {
		for _, p := range rule.Properties {
			if p.Name != prop {
				continue
			}
			if !winnerSet {
				winner = Winner{Selector: rule.Selector, Value: p.Value, Important: p.Important}
				winnerSet = true
				winnerImportant = p.Important
				continue
			}
			if p.Important && !winnerImportant {
				winner = Winner{Selector: rule.Selector, Value: p.Value, Important: p.Important}
				winnerImportant = true
				continue
			}
			if p.Important == winnerImportant {
				winner = Winner{Selector: rule.Selector, Value: p.Value, Important: p.Important}
			}
		}
	}
	return winner
}

func boxModelBounds(model *dom.BoxModel) *Bounds {
	if model == nil || len(model.Content) < 8 {
		return nil
	}
	content := model.Content
	return &Bounds{
		X:      content[0],
		Y:      content[1],
		Width:  content[2] - content[0],
		Height: content[5] - content[1],
	}
}

func writeMatchedMarkdown(path string, result MatchedStylesResult) error {
	content := "# sbcap Matched Styles Report\n\n"
	for _, s := range result.Styles {
		content += fmt.Sprintf("## %s\n\n", s.Name)
		content += fmt.Sprintf("Selector: `%s`\n\n", s.Selector)
		content += "### Winner Summary\n\n"
		content += "| Property | Original Winner | React Winner |\n"
		content += "| --- | --- | --- |\n"
		for _, w := range s.Winners {
			content += fmt.Sprintf("| %s | %s (%s) | %s (%s) |\n", w.Property, w.Original.Selector, w.Original.Value, w.React.Selector, w.React.Value)
		}
		content += "\n"
	}
	return os.WriteFile(path, []byte(content), 0o644)
}

func hasReport(reports []string, value string) bool {
	for _, r := range reports {
		if r == value {
			return true
		}
	}
	return false
}
