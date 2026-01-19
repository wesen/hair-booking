package modes

import (
	"context"

	"github.com/go-go-golems/XXX/internal/sbcap/config"
)

func Capture(ctx context.Context, cfg *config.Config) error {
	return RunCapture(ctx, cfg)
}

func MatchedStyles(ctx context.Context, cfg *config.Config) error {
	return RunMatchedStyles(ctx, cfg)
}

func AIReview(ctx context.Context, cfg *config.Config) error {
	return RunAIReview(ctx, cfg)
}
