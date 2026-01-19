package driver

import (
	"context"
	"os"
	"time"

	"github.com/chromedp/cdproto/emulation"
	"github.com/chromedp/chromedp"
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

func NewBrowser(parent context.Context) (*Browser, error) {
	allocCtx, allocCancel := chromedp.NewExecAllocator(parent, chromedp.Headless, chromedp.NoFirstRun, chromedp.NoDefaultBrowserCheck)
	browserCtx, browserCancel := chromedp.NewContext(allocCtx)
	return &Browser{
		allocCtx:      allocCtx,
		allocCancel:   allocCancel,
		browserCtx:    browserCtx,
		browserCancel: browserCancel,
	}, nil
}

func (b *Browser) Close() {
	if b.browserCancel != nil {
		b.browserCancel()
	}
	if b.allocCancel != nil {
		b.allocCancel()
	}
}

func (b *Browser) NewPage() (*Page, error) {
	ctx, cancel := chromedp.NewContext(b.browserCtx)
	return &Page{ctx: ctx, cancel: cancel}, nil
}

func (p *Page) Close() {
	if p.cancel != nil {
		p.cancel()
	}
}

func (p *Page) Context() context.Context {
	return p.ctx
}

func (p *Page) SetViewport(width, height int) error {
	return chromedp.Run(p.ctx, emulation.SetDeviceMetricsOverride(int64(width), int64(height), 1, false))
}

func (p *Page) Goto(url string) error {
	return chromedp.Run(p.ctx, chromedp.Navigate(url))
}

func (p *Page) Wait(d time.Duration) {
	_ = chromedp.Run(p.ctx, chromedp.Sleep(d))
}

func (p *Page) FullScreenshot(path string) error {
	var buf []byte
	if err := chromedp.Run(p.ctx, chromedp.FullScreenshot(&buf, 90)); err != nil {
		return err
	}
	return os.WriteFile(path, buf, 0o644)
}

func (p *Page) Screenshot(selector, path string) error {
	var buf []byte
	if err := chromedp.Run(p.ctx, chromedp.Screenshot(selector, &buf, chromedp.ByQuery)); err != nil {
		return err
	}
	return os.WriteFile(path, buf, 0o644)
}

func (p *Page) Evaluate(script string, out any) error {
	return chromedp.Run(p.ctx, chromedp.Evaluate(script, out))
}
