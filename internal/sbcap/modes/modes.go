package modes

import (
	"context"
	"fmt"

	"github.com/go-go-golems/XXX/internal/sbcap/config"
)

func Capture(ctx context.Context, cfg *config.Config) error {
	return RunCapture(ctx, cfg)
}

func CSSDiff(ctx context.Context, cfg *config.Config) error {
	return fmt.Errorf("cssdiff mode not implemented yet")
}

func MatchedStyles(ctx context.Context, cfg *config.Config) error {
	return fmt.Errorf("matched-styles mode not implemented yet")
}

func AIReview(ctx context.Context, cfg *config.Config) error {
	return fmt.Errorf("ai-review mode not implemented yet")
}
