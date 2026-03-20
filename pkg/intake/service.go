package intake

import (
	"context"
	"io"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/go-go-golems/hair-booking/pkg/storage"
	"github.com/google/uuid"
	"github.com/pkg/errors"
)

var (
	ErrInvalidInput   = errors.New("invalid intake input")
	filenameSanitizer = regexp.MustCompile(`[^a-zA-Z0-9._-]+`)
)

type Submission struct {
	ID              uuid.UUID  `json:"id"`
	ClientID        *uuid.UUID `json:"client_id,omitempty"`
	ServiceType     string     `json:"service_type"`
	HairLength      string     `json:"hair_length,omitempty"`
	HairDensity     string     `json:"hair_density,omitempty"`
	HairTexture     string     `json:"hair_texture,omitempty"`
	PrevExtensions  string     `json:"prev_extensions,omitempty"`
	ColorService    string     `json:"color_service,omitempty"`
	NaturalLevel    string     `json:"natural_level,omitempty"`
	CurrentColor    string     `json:"current_color,omitempty"`
	ChemicalHistory []string   `json:"chemical_history,omitempty"`
	LastChemical    string     `json:"last_chemical,omitempty"`
	DesiredLength   int        `json:"desired_length,omitempty"`
	ExtType         string     `json:"ext_type,omitempty"`
	Budget          string     `json:"budget,omitempty"`
	Maintenance     string     `json:"maintenance,omitempty"`
	Deadline        string     `json:"deadline,omitempty"`
	DreamResult     string     `json:"dream_result,omitempty"`
	EstimateLow     int        `json:"estimate_low"`
	EstimateHigh    int        `json:"estimate_high"`
}

type Photo struct {
	ID         uuid.UUID `json:"id"`
	IntakeID   uuid.UUID `json:"intake_id"`
	Slot       string    `json:"slot"`
	StorageKey string    `json:"storage_key"`
	URL        string    `json:"url"`
}

type Repository interface {
	CreateSubmission(ctx context.Context, submission Submission) (*Submission, error)
	AddPhoto(ctx context.Context, intakeID uuid.UUID, slot, storageKey, url string) (*Photo, error)
}

type Service struct {
	repo    Repository
	storage storage.BlobStore
}

func NewService(repo Repository, blobStore storage.BlobStore) *Service {
	return &Service{
		repo:    repo,
		storage: blobStore,
	}
}

func (s *Service) CreateSubmission(ctx context.Context, submission Submission) (*Submission, error) {
	if s == nil || s.repo == nil {
		return nil, errors.New("intake repository is not configured")
	}

	submission.ServiceType = strings.ToLower(strings.TrimSpace(submission.ServiceType))
	switch submission.ServiceType {
	case "extensions", "color", "both":
	default:
		return nil, errors.Wrap(ErrInvalidInput, "service_type must be extensions, color, or both")
	}

	estimateLow, estimateHigh := CalculateEstimate(submission)
	submission.EstimateLow = estimateLow
	submission.EstimateHigh = estimateHigh
	return s.repo.CreateSubmission(ctx, submission)
}

func (s *Service) AddPhoto(ctx context.Context, intakeID uuid.UUID, slot, filename string, reader io.Reader) (*Photo, error) {
	if s == nil || s.repo == nil {
		return nil, errors.New("intake repository is not configured")
	}
	if s.storage == nil {
		return nil, errors.New("blob store is not configured")
	}

	slot = strings.ToLower(strings.TrimSpace(slot))
	switch slot {
	case "front", "back", "hairline", "inspo":
	default:
		return nil, errors.Wrap(ErrInvalidInput, "slot must be front, back, hairline, or inspo")
	}

	cleanName := sanitizeFilename(filename)
	storageKey := filepath.ToSlash(filepath.Join("intake", intakeID.String(), uuid.NewString()+"-"+cleanName))
	saved, err := s.storage.Save(ctx, storageKey, reader)
	if err != nil {
		return nil, err
	}

	return s.repo.AddPhoto(ctx, intakeID, slot, saved.StorageKey, saved.URL)
}

func CalculateEstimate(submission Submission) (int, int) {
	low := 0
	high := 0

	switch submission.ServiceType {
	case "extensions":
		low, high = 700, 1400
	case "color":
		low, high = 150, 450
	case "both":
		low, high = 900, 1800
	}

	if submission.DesiredLength >= 3 {
		low += 150
		high += 300
	}
	if submission.ExtType == "ktip" {
		low += 200
		high += 400
	}
	if submission.ColorService == "correction" {
		low += 200
		high += 500
	}
	if submission.ColorService == "highlight" {
		low += 100
		high += 250
	}
	if len(submission.ChemicalHistory) >= 2 {
		high += 150
	}

	return low, high
}

func sanitizeFilename(filename string) string {
	filename = filepath.Base(strings.TrimSpace(filename))
	if filename == "." || filename == "" {
		return "upload.bin"
	}
	filename = filenameSanitizer.ReplaceAllString(filename, "_")
	if filename == "" {
		return "upload.bin"
	}
	return filename
}
