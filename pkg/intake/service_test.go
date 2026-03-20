package intake

import (
	"bytes"
	"context"
	"io"
	"testing"

	"github.com/go-go-golems/hair-booking/pkg/storage"
	"github.com/google/uuid"
)

type fakeRepository struct {
	submission Submission
	photo      *Photo
}

func (f *fakeRepository) CreateSubmission(ctx context.Context, submission Submission) (*Submission, error) {
	f.submission = submission
	submission.ID = uuid.New()
	return &submission, nil
}

func (f *fakeRepository) AddPhoto(ctx context.Context, intakeID uuid.UUID, slot, storageKey, url string) (*Photo, error) {
	f.photo = &Photo{
		ID:         uuid.New(),
		IntakeID:   intakeID,
		Slot:       slot,
		StorageKey: storageKey,
		URL:        url,
	}
	return f.photo, nil
}

type fakeBlobStore struct{}

func (f *fakeBlobStore) Save(ctx context.Context, key string, reader io.Reader) (*storage.SavedObject, error) {
	buf := new(bytes.Buffer)
	_, _ = buf.ReadFrom(reader)
	return &storage.SavedObject{
		StorageKey: key,
		URL:        "http://127.0.0.1:8080/uploads/" + key,
	}, nil
}

func TestCalculateEstimateExtensions(t *testing.T) {
	low, high := CalculateEstimate(Submission{
		ServiceType:     "extensions",
		DesiredLength:   4,
		ExtType:         "ktip",
		ChemicalHistory: []string{"Bleach / highlights", "Box dye"},
	})

	if low != 1050 || high != 2250 {
		t.Fatalf("expected estimate 1050-2250, got %d-%d", low, high)
	}
}

func TestCreateSubmissionComputesEstimate(t *testing.T) {
	repo := &fakeRepository{}
	service := NewService(repo, &fakeBlobStore{})

	created, err := service.CreateSubmission(context.Background(), Submission{
		ServiceType:   "color",
		ColorService:  "highlight",
		DesiredLength: 1,
	})
	if err != nil {
		t.Fatalf("CreateSubmission returned error: %v", err)
	}

	if created.EstimateLow == 0 || created.EstimateHigh == 0 {
		t.Fatal("expected estimate values to be computed")
	}
}

func TestAddPhotoPersistsMetadata(t *testing.T) {
	repo := &fakeRepository{}
	service := NewService(repo, &fakeBlobStore{})
	intakeID := uuid.New()

	photo, err := service.AddPhoto(context.Background(), intakeID, "front", "hair.png", bytes.NewBufferString("png"))
	if err != nil {
		t.Fatalf("AddPhoto returned error: %v", err)
	}

	if photo.IntakeID != intakeID {
		t.Fatalf("expected intake id %s, got %s", intakeID, photo.IntakeID)
	}
	if photo.Slot != "front" {
		t.Fatalf("expected slot front, got %q", photo.Slot)
	}
}
