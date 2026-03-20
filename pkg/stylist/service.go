package stylist

import (
	"context"
	"strings"
	"time"

	hairclients "github.com/go-go-golems/hair-booking/pkg/clients"
	hairintake "github.com/go-go-golems/hair-booking/pkg/intake"
	"github.com/google/uuid"
	"github.com/pkg/errors"
)

var (
	ErrNotFound     = errors.New("stylist resource not found")
	ErrInvalidInput = errors.New("invalid stylist input")
)

const (
	ReviewStatusNew              = "new"
	ReviewStatusInReview         = "in_review"
	ReviewStatusNeedsClientReply = "needs_client_reply"
	ReviewStatusApprovedToBook   = "approved_to_book"
	ReviewStatusArchived         = "archived"

	ReviewPriorityNormal = "normal"
	ReviewPriorityUrgent = "urgent"

	defaultListLimit = 50
	maxListLimit     = 200
)

type IntakeReview struct {
	ID              uuid.UUID  `json:"id"`
	IntakeID        uuid.UUID  `json:"intake_id"`
	Status          string     `json:"status"`
	Priority        string     `json:"priority"`
	Summary         string     `json:"summary,omitempty"`
	InternalNotes   string     `json:"internal_notes,omitempty"`
	QuotedPriceLow  *int       `json:"quoted_price_low,omitempty"`
	QuotedPriceHigh *int       `json:"quoted_price_high,omitempty"`
	ReviewedAt      *time.Time `json:"reviewed_at,omitempty"`
	CreatedAt       *time.Time `json:"created_at,omitempty"`
	UpdatedAt       *time.Time `json:"updated_at,omitempty"`
}

type IntakeListFilter struct {
	Status string
	Limit  int
	Offset int
}

type IntakeListItem struct {
	ID           uuid.UUID           `json:"id"`
	ServiceType  string              `json:"service_type"`
	DreamResult  string              `json:"dream_result,omitempty"`
	EstimateLow  int                 `json:"estimate_low"`
	EstimateHigh int                 `json:"estimate_high"`
	PhotoCount   int                 `json:"photo_count"`
	SubmittedAt  time.Time           `json:"submitted_at"`
	Client       *hairclients.Client `json:"client,omitempty"`
	Review       IntakeReview        `json:"review"`
	LastActionAt time.Time           `json:"last_action_at"`
}

type IntakeDetail struct {
	Submission *hairintake.Submission `json:"submission"`
	Client     *hairclients.Client    `json:"client,omitempty"`
	Photos     []hairintake.Photo     `json:"photos"`
	Review     IntakeReview           `json:"review"`
}

type IntakeReviewUpdate struct {
	Status          *string `json:"status"`
	Priority        *string `json:"priority"`
	Summary         *string `json:"summary"`
	InternalNotes   *string `json:"internal_notes"`
	QuotedPriceLow  *int    `json:"quoted_price_low"`
	QuotedPriceHigh *int    `json:"quoted_price_high"`
}

type Repository interface {
	ListIntakes(ctx context.Context, filter IntakeListFilter) ([]IntakeListItem, error)
	GetIntake(ctx context.Context, intakeID uuid.UUID) (*IntakeDetail, error)
	UpsertIntakeReview(ctx context.Context, intakeID uuid.UUID, update IntakeReviewUpdate, reviewedAt time.Time) (*IntakeReview, error)
}

type Service struct {
	repo Repository
	now  func() time.Time
}

func NewService(repo Repository) *Service {
	return &Service{
		repo: repo,
		now: func() time.Time {
			return time.Now().UTC()
		},
	}
}

func (s *Service) ListIntakes(ctx context.Context, filter IntakeListFilter) ([]IntakeListItem, error) {
	if s == nil || s.repo == nil {
		return nil, errors.New("stylist repository is not configured")
	}

	normalized, err := normalizeListFilter(filter)
	if err != nil {
		return nil, err
	}

	items, err := s.repo.ListIntakes(ctx, normalized)
	if err != nil {
		return nil, err
	}
	for i := range items {
		items[i].Review = normalizeReview(items[i].Review, items[i].ID)
		if items[i].LastActionAt.IsZero() {
			items[i].LastActionAt = items[i].SubmittedAt
		}
	}
	return items, nil
}

func (s *Service) GetIntake(ctx context.Context, intakeID uuid.UUID) (*IntakeDetail, error) {
	if s == nil || s.repo == nil {
		return nil, errors.New("stylist repository is not configured")
	}
	if intakeID == uuid.Nil {
		return nil, errors.Wrap(ErrInvalidInput, "intake id is required")
	}

	detail, err := s.repo.GetIntake(ctx, intakeID)
	if err != nil {
		return nil, err
	}
	if detail == nil || detail.Submission == nil {
		return nil, errors.Wrap(ErrNotFound, "intake not found")
	}
	detail.Review = normalizeReview(detail.Review, detail.Submission.ID)
	return detail, nil
}

func (s *Service) UpdateIntakeReview(ctx context.Context, intakeID uuid.UUID, update IntakeReviewUpdate) (*IntakeReview, error) {
	if s == nil || s.repo == nil {
		return nil, errors.New("stylist repository is not configured")
	}
	if intakeID == uuid.Nil {
		return nil, errors.Wrap(ErrInvalidInput, "intake id is required")
	}

	normalized, err := normalizeReviewUpdate(update)
	if err != nil {
		return nil, err
	}

	review, err := s.repo.UpsertIntakeReview(ctx, intakeID, normalized, s.now())
	if err != nil {
		return nil, err
	}
	return review, nil
}

func normalizeListFilter(filter IntakeListFilter) (IntakeListFilter, error) {
	filter.Status = normalizeEnum(filter.Status)
	if filter.Status != "" && !isValidReviewStatus(filter.Status) {
		return IntakeListFilter{}, errors.Wrap(ErrInvalidInput, "status filter must be one of new, in_review, needs_client_reply, approved_to_book, archived")
	}
	if filter.Limit <= 0 {
		filter.Limit = defaultListLimit
	}
	if filter.Limit > maxListLimit {
		filter.Limit = maxListLimit
	}
	if filter.Offset < 0 {
		filter.Offset = 0
	}
	return filter, nil
}

func normalizeReviewUpdate(update IntakeReviewUpdate) (IntakeReviewUpdate, error) {
	if update.Status == nil &&
		update.Priority == nil &&
		update.Summary == nil &&
		update.InternalNotes == nil &&
		update.QuotedPriceLow == nil &&
		update.QuotedPriceHigh == nil {
		return IntakeReviewUpdate{}, errors.Wrap(ErrInvalidInput, "review update payload was empty")
	}

	if update.Status != nil {
		value := normalizeEnum(*update.Status)
		if !isValidReviewStatus(value) {
			return IntakeReviewUpdate{}, errors.Wrap(ErrInvalidInput, "status must be one of new, in_review, needs_client_reply, approved_to_book, archived")
		}
		update.Status = &value
	}
	if update.Priority != nil {
		value := normalizeEnum(*update.Priority)
		if !isValidReviewPriority(value) {
			return IntakeReviewUpdate{}, errors.Wrap(ErrInvalidInput, "priority must be normal or urgent")
		}
		update.Priority = &value
	}
	if update.Summary != nil {
		value := strings.TrimSpace(*update.Summary)
		update.Summary = &value
	}
	if update.InternalNotes != nil {
		value := strings.TrimSpace(*update.InternalNotes)
		update.InternalNotes = &value
	}
	if update.QuotedPriceLow != nil && *update.QuotedPriceLow < 0 {
		return IntakeReviewUpdate{}, errors.Wrap(ErrInvalidInput, "quoted_price_low cannot be negative")
	}
	if update.QuotedPriceHigh != nil && *update.QuotedPriceHigh < 0 {
		return IntakeReviewUpdate{}, errors.Wrap(ErrInvalidInput, "quoted_price_high cannot be negative")
	}

	low := update.QuotedPriceLow
	high := update.QuotedPriceHigh
	if low != nil && high != nil && *low > *high {
		return IntakeReviewUpdate{}, errors.Wrap(ErrInvalidInput, "quoted_price_low cannot exceed quoted_price_high")
	}

	return update, nil
}

func normalizeReview(review IntakeReview, intakeID uuid.UUID) IntakeReview {
	review.IntakeID = intakeID
	if review.Status == "" {
		review.Status = ReviewStatusNew
	}
	if review.Priority == "" {
		review.Priority = ReviewPriorityNormal
	}
	return review
}

func normalizeEnum(value string) string {
	return strings.ToLower(strings.TrimSpace(value))
}

func isValidReviewStatus(value string) bool {
	switch value {
	case ReviewStatusNew, ReviewStatusInReview, ReviewStatusNeedsClientReply, ReviewStatusApprovedToBook, ReviewStatusArchived:
		return true
	default:
		return false
	}
}

func isValidReviewPriority(value string) bool {
	switch value {
	case ReviewPriorityNormal, ReviewPriorityUrgent:
		return true
	default:
		return false
	}
}
