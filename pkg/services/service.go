package services

import (
	"context"
	"strings"

	"github.com/google/uuid"
	"github.com/pkg/errors"
)

type CatalogItem struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Category    string    `json:"category"`
	DurationMin int       `json:"duration_min"`
	PriceLow    *int      `json:"price_low,omitempty"`
	PriceHigh   *int      `json:"price_high,omitempty"`
	IsActive    bool      `json:"is_active"`
	SortOrder   int       `json:"sort_order"`
}

type Repository interface {
	ListActive(ctx context.Context, category string) ([]CatalogItem, error)
}

type Service struct {
	repo Repository
}

func NewService(repo Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) ListActive(ctx context.Context, category string) ([]CatalogItem, error) {
	if s == nil || s.repo == nil {
		return nil, errors.New("service catalog repository is not configured")
	}

	return s.repo.ListActive(ctx, strings.ToLower(strings.TrimSpace(category)))
}
