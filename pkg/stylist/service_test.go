package stylist

import (
	"context"
	"testing"
	"time"

	hairclients "github.com/go-go-golems/hair-booking/pkg/clients"
	hairintake "github.com/go-go-golems/hair-booking/pkg/intake"
	"github.com/google/uuid"
)

type fakeRepository struct {
	items        []IntakeListItem
	detail       *IntakeDetail
	upserted     *IntakeReview
	listFilter   IntakeListFilter
	lastUpdate   IntakeReviewUpdate
	lastIntakeID uuid.UUID
	lastNow      time.Time
}

func (f *fakeRepository) ListIntakes(ctx context.Context, filter IntakeListFilter) ([]IntakeListItem, error) {
	f.listFilter = filter
	return f.items, nil
}

func (f *fakeRepository) GetIntake(ctx context.Context, intakeID uuid.UUID) (*IntakeDetail, error) {
	f.lastIntakeID = intakeID
	return f.detail, nil
}

func (f *fakeRepository) UpsertIntakeReview(ctx context.Context, intakeID uuid.UUID, update IntakeReviewUpdate, reviewedAt time.Time) (*IntakeReview, error) {
	f.lastIntakeID = intakeID
	f.lastUpdate = update
	f.lastNow = reviewedAt
	if f.upserted != nil {
		return f.upserted, nil
	}
	return &IntakeReview{
		ID:       uuid.New(),
		IntakeID: intakeID,
		Status:   ReviewStatusInReview,
		Priority: ReviewPriorityNormal,
	}, nil
}

func TestListIntakesNormalizesFilterDefaults(t *testing.T) {
	repo := &fakeRepository{}
	service := NewService(repo)

	_, err := service.ListIntakes(context.Background(), IntakeListFilter{})
	if err != nil {
		t.Fatalf("ListIntakes returned error: %v", err)
	}

	if repo.listFilter.Limit != defaultListLimit {
		t.Fatalf("expected default list limit %d, got %d", defaultListLimit, repo.listFilter.Limit)
	}
	if repo.listFilter.Offset != 0 {
		t.Fatalf("expected default offset 0, got %d", repo.listFilter.Offset)
	}
}

func TestListIntakesRejectsUnknownStatus(t *testing.T) {
	service := NewService(&fakeRepository{})

	_, err := service.ListIntakes(context.Background(), IntakeListFilter{Status: "mystery"})
	if err == nil {
		t.Fatal("expected ListIntakes to reject invalid status")
	}
}

func TestGetIntakeAddsDefaultReviewValues(t *testing.T) {
	intakeID := uuid.New()
	repo := &fakeRepository{
		detail: &IntakeDetail{
			Submission: &hairintake.Submission{
				ID:          intakeID,
				ServiceType: "extensions",
			},
			Client: &hairclients.Client{Name: "Alice"},
			Photos: []hairintake.Photo{},
		},
	}
	service := NewService(repo)

	detail, err := service.GetIntake(context.Background(), intakeID)
	if err != nil {
		t.Fatalf("GetIntake returned error: %v", err)
	}

	if detail.Review.Status != ReviewStatusNew {
		t.Fatalf("expected default review status %q, got %q", ReviewStatusNew, detail.Review.Status)
	}
	if detail.Review.Priority != ReviewPriorityNormal {
		t.Fatalf("expected default review priority %q, got %q", ReviewPriorityNormal, detail.Review.Priority)
	}
}

func TestUpdateIntakeReviewRejectsReversedQuoteRange(t *testing.T) {
	service := NewService(&fakeRepository{})
	low := 1800
	high := 1200

	_, err := service.UpdateIntakeReview(context.Background(), uuid.New(), IntakeReviewUpdate{
		QuotedPriceLow:  &low,
		QuotedPriceHigh: &high,
	})
	if err == nil {
		t.Fatal("expected UpdateIntakeReview to reject reversed quote range")
	}
}

func TestUpdateIntakeReviewNormalizesEnumValues(t *testing.T) {
	repo := &fakeRepository{}
	service := NewService(repo)
	now := time.Date(2026, time.March, 20, 16, 0, 0, 0, time.UTC)
	service.now = func() time.Time { return now }

	status := " In_Review "
	priority := " URGENT "
	summary := "  Needs longer consult  "
	internalNotes := "  Ask about bleach history  "

	_, err := service.UpdateIntakeReview(context.Background(), uuid.New(), IntakeReviewUpdate{
		Status:        &status,
		Priority:      &priority,
		Summary:       &summary,
		InternalNotes: &internalNotes,
	})
	if err != nil {
		t.Fatalf("UpdateIntakeReview returned error: %v", err)
	}

	if repo.lastUpdate.Status == nil || *repo.lastUpdate.Status != ReviewStatusInReview {
		t.Fatalf("expected normalized status %q, got %#v", ReviewStatusInReview, repo.lastUpdate.Status)
	}
	if repo.lastUpdate.Priority == nil || *repo.lastUpdate.Priority != ReviewPriorityUrgent {
		t.Fatalf("expected normalized priority %q, got %#v", ReviewPriorityUrgent, repo.lastUpdate.Priority)
	}
	if repo.lastUpdate.Summary == nil || *repo.lastUpdate.Summary != "Needs longer consult" {
		t.Fatalf("expected trimmed summary, got %#v", repo.lastUpdate.Summary)
	}
	if repo.lastUpdate.InternalNotes == nil || *repo.lastUpdate.InternalNotes != "Ask about bleach history" {
		t.Fatalf("expected trimmed internal notes, got %#v", repo.lastUpdate.InternalNotes)
	}
	if !repo.lastNow.Equal(now) {
		t.Fatalf("expected review timestamp %s, got %s", now, repo.lastNow)
	}
}
