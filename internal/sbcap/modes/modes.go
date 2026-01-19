package modes

import (
	"context"
	"fmt"

	"github.com/go-go-golems/XXX/internal/sbcap/config"
)

func Capture(ctx context.Context, cfg *config.Config) error {
	return RunCapture(ctx, cfg)
}

func MatchedStyles(ctx context.Context, cfg *config.Config) error {
	return RunMatchedStyles(ctx, cfg)
}

func AIReview(ctx context.Context, cfg *config.Config) error {
	return fmt.Errorf("ai-review mode not implemented yet")
}
