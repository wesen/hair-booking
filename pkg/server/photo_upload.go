package server

import (
	"bytes"
	"io"
	"mime/multipart"
	"net/http"
	"strings"

	"github.com/pkg/errors"
)

const maxPhotoUploadBytes = 10 << 20

func readValidatedPhotoUpload(file multipart.File, header *multipart.FileHeader) (*bytes.Reader, error) {
	if file == nil || header == nil {
		return nil, errors.New("a file upload is required")
	}

	data, err := io.ReadAll(io.LimitReader(file, maxPhotoUploadBytes+1))
	if err != nil {
		return nil, errors.Wrap(err, "failed to read uploaded file")
	}
	if len(data) == 0 {
		return nil, errors.New("uploaded file must not be empty")
	}
	if len(data) > maxPhotoUploadBytes {
		return nil, errors.New("uploaded file must be 10 MB or smaller")
	}

	contentType := http.DetectContentType(data)
	switch strings.ToLower(strings.TrimSpace(contentType)) {
	case "image/jpeg", "image/png", "image/webp":
	default:
		return nil, errors.New("uploaded file must be a JPEG, PNG, or WebP image")
	}

	return bytes.NewReader(data), nil
}
