package driver

import (
	"context"
	"os"
	"strings"
	"time"

	"github.com/chromedp/cdproto/emulation"
	"github.com/chromedp/chromedp"
	"github.com/rs/zerolog/log"
)

type Browser struct {
	allocCtx      context.Context
	allocCancel   context.CancelFunc
	browserCtx    context.Context
	browserCancel context.CancelFunc
}

type Page struct {
	ctx    context.Context
	cancel context.CancelFunc
}

var debugEnabled = strings.EqualFold(os.Getenv("SBCAP_DEBUG"), "1") ||
	strings.EqualFold(os.Getenv("SBCAP_DEBUG"), "true") ||
	strings.EqualFold(os.Getenv("SBCAP_DEBUG"), "yes")

func DebugEnabled() bool {
	return debugEnabled
}

func NewBrowser(parent context.Context) (*Browser, error) {
	if debugEnabled {
		log.Info().Msg("sbcap chromedp: initializing browser")
	}
	allocCtx, allocCancel := chromedp.NewExecAllocator(parent, chromedp.Headless, chromedp.NoFirstRun, chromedp.NoDefaultBrowserCheck)
	browserCtx, browserCancel := chromedp.NewContext(allocCtx)
	if debugEnabled {
		log.Info().Msg("sbcap chromedp: browser context created")
	}
	return &Browser{
		allocCtx:      allocCtx,
		allocCancel:   allocCancel,
		browserCtx:    browserCtx,
		browserCancel: browserCancel,
	}, nil
}

func (b *Browser) Close() {
	if debugEnabled {
		log.Info().Msg("sbcap chromedp: closing browser")
	}
	if b.browserCancel != nil {
		b.browserCancel()
	}
	if b.allocCancel != nil {
		b.allocCancel()
	}
}

func (b *Browser) NewPage() (*Page, error) {
	if debugEnabled {
		log.Info().Msg("sbcap chromedp: creating page")
	}
	ctx, cancel := chromedp.NewContext(b.browserCtx)
	return &Page{ctx: ctx, cancel: cancel}, nil
}

func (p *Page) Close() {
	if debugEnabled {
		log.Info().Msg("sbcap chromedp: closing page")
	}
	if p.cancel != nil {
		p.cancel()
	}
}

func (p *Page) Context() context.Context {
	return p.ctx
}

func (p *Page) SetViewport(width, height int) error {
	if debugEnabled {
		log.Info().Int("width", width).Int("height", height).Msg("sbcap chromedp: set viewport")
	}
	if err := chromedp.Run(p.ctx, emulation.SetDeviceMetricsOverride(int64(width), int64(height), 1, false)); err != nil {
		if debugEnabled {
			log.Error().Err(err).Msg("sbcap chromedp: set viewport failed")
		}
		return err
	}
	return nil
}

func (p *Page) Goto(url string) error {
	if debugEnabled {
		log.Info().Str("url", url).Msg("sbcap chromedp: navigate")
	}
	if err := chromedp.Run(p.ctx, chromedp.Navigate(url)); err != nil {
		if debugEnabled {
			log.Error().Err(err).Str("url", url).Msg("sbcap chromedp: navigate failed")
		}
		return err
	}
	return nil
}

func (p *Page) Wait(d time.Duration) {
	if debugEnabled {
		log.Info().Dur("duration", d).Msg("sbcap chromedp: wait")
	}
	_ = chromedp.Run(p.ctx, chromedp.Sleep(d))
}

func (p *Page) FullScreenshot(path string) error {
	if debugEnabled {
		log.Info().Str("path", path).Msg("sbcap chromedp: full screenshot")
	}
	var buf []byte
	if err := chromedp.Run(p.ctx, chromedp.FullScreenshot(&buf, 90)); err != nil {
		if debugEnabled {
			log.Error().Err(err).Str("path", path).Msg("sbcap chromedp: full screenshot failed")
		}
		return err
	}
	return os.WriteFile(path, buf, 0o644)
}

func (p *Page) Screenshot(selector, path string) error {
	if debugEnabled {
		log.Info().Str("selector", selector).Str("path", path).Msg("sbcap chromedp: screenshot")
	}
	var buf []byte
	if err := chromedp.Run(p.ctx, chromedp.Screenshot(selector, &buf, chromedp.ByQuery)); err != nil {
		if debugEnabled {
			log.Error().Err(err).Str("selector", selector).Str("path", path).Msg("sbcap chromedp: screenshot failed")
		}
		return err
	}
	return os.WriteFile(path, buf, 0o644)
}

func (p *Page) Evaluate(script string, out any) error {
	if debugEnabled {
		log.Info().Msg("sbcap chromedp: evaluate script")
	}
	if err := chromedp.Run(p.ctx, chromedp.Evaluate(script, out)); err != nil {
		if debugEnabled {
			log.Error().Err(err).Msg("sbcap chromedp: evaluate failed")
		}
		return err
	}
	return nil
}
