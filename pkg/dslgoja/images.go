package dslgoja

import (
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
)

const defaultUploadMaxBytes int64 = 10 << 20

type UploadIntent struct {
	UploadID  string    `json:"uploadId"`
	SessionID string    `json:"sessionId"`
	Purpose   string    `json:"purpose"`
	Slot      string    `json:"slot,omitempty"`
	Method    string    `json:"method"`
	URL       string    `json:"url"`
	FieldName string    `json:"fieldName"`
	Accept    []string  `json:"accept"`
	MaxBytes  int64     `json:"maxBytes"`
	ExpiresAt time.Time `json:"expiresAt"`
}

type UploadIntentOptions struct {
	Purpose          string   `json:"purpose"`
	Slot             string   `json:"slot"`
	Accept           []string `json:"accept"`
	MaxBytes         int64    `json:"maxBytes"`
	ExpiresInSeconds int64    `json:"expiresInSeconds"`
}

type UploadedImage struct {
	UploadID         string    `json:"uploadId"`
	SessionID        string    `json:"sessionId"`
	Purpose          string    `json:"purpose"`
	Slot             string    `json:"slot,omitempty"`
	OriginalFilename string    `json:"originalFilename,omitempty"`
	ContentType      string    `json:"contentType,omitempty"`
	SizeBytes        int64     `json:"sizeBytes"`
	StorageKey       string    `json:"storageKey"`
	URL              string    `json:"url"`
	CreatedAt        time.Time `json:"createdAt"`
}

type CompleteUploadInput struct {
	OriginalFilename string
	ContentType      string
	SizeBytes        int64
	StorageKey       string
	URL              string
}

func (s *FlowSession) CreateUploadIntent(options UploadIntentOptions) (UploadIntent, error) {
	purpose := strings.TrimSpace(options.Purpose)
	if purpose == "" {
		purpose = "intake-photo"
	}
	if purpose != "intake-photo" {
		return UploadIntent{}, fmt.Errorf("unsupported upload purpose %q", purpose)
	}
	accept := options.Accept
	if len(accept) == 0 {
		accept = []string{"image/jpeg", "image/png", "image/webp"}
	}
	maxBytes := options.MaxBytes
	if maxBytes <= 0 || maxBytes > defaultUploadMaxBytes {
		maxBytes = defaultUploadMaxBytes
	}
	expiresIn := options.ExpiresInSeconds
	if expiresIn <= 0 {
		expiresIn = 15 * 60
	}
	id := "upl_" + uuid.NewString()
	intent := UploadIntent{
		UploadID:  id,
		SessionID: s.ID,
		Purpose:   purpose,
		Slot:      strings.TrimSpace(options.Slot),
		Method:    "POST",
		URL:       "/api/dsl/flows/" + s.ID + "/uploads/" + id,
		FieldName: "file",
		Accept:    accept,
		MaxBytes:  maxBytes,
		ExpiresAt: time.Now().UTC().Add(time.Duration(expiresIn) * time.Second),
	}
	if s.UploadIntents == nil {
		s.UploadIntents = map[string]UploadIntent{}
	}
	s.UploadIntents[id] = intent
	return intent, nil
}

func (s *FlowSession) UploadIntent(id string) (UploadIntent, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	intent, ok := s.UploadIntents[id]
	return intent, ok
}

func (s *FlowSession) CompleteUpload(uploadID string, input CompleteUploadInput) (UploadedImage, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	intent, ok := s.UploadIntents[uploadID]
	if !ok {
		return UploadedImage{}, fmt.Errorf("unknown upload intent %q", uploadID)
	}
	if time.Now().UTC().After(intent.ExpiresAt) {
		return UploadedImage{}, fmt.Errorf("upload intent %q expired", uploadID)
	}
	image := UploadedImage{
		UploadID:         uploadID,
		SessionID:        s.ID,
		Purpose:          intent.Purpose,
		Slot:             intent.Slot,
		OriginalFilename: input.OriginalFilename,
		ContentType:      input.ContentType,
		SizeBytes:        input.SizeBytes,
		StorageKey:       input.StorageKey,
		URL:              input.URL,
		CreatedAt:        time.Now().UTC(),
	}
	if s.Uploads == nil {
		s.Uploads = map[string]UploadedImage{}
	}
	s.Uploads[uploadID] = image
	return image, nil
}

func (s *FlowSession) UploadedImage(uploadID string) (UploadedImage, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	image, ok := s.Uploads[uploadID]
	return image, ok
}

func (s *FlowSession) UploadedImages(purpose string) []UploadedImage {
	s.mu.Lock()
	defer s.mu.Unlock()
	var images []UploadedImage
	for _, image := range s.Uploads {
		if purpose == "" || image.Purpose == purpose {
			images = append(images, image)
		}
	}
	return images
}
