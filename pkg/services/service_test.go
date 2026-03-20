package services

import (
	"context"
	"testing"
)

type fakeRepository struct {
	category string
	result   []CatalogItem
}

func (f *fakeRepository) ListActive(ctx context.Context, category string) ([]CatalogItem, error) {
	f.category = category
	return f.result, nil
}

func TestListActiveNormalizesCategory(t *testing.T) {
	repo := &fakeRepository{}
	service := NewService(repo)

	if _, err := service.ListActive(context.Background(), " Color "); err != nil {
		t.Fatalf("ListActive returned error: %v", err)
	}

	if repo.category != "color" {
		t.Fatalf("expected normalized category color, got %q", repo.category)
	}
}
