package storage

import (
	"context"
	"io"
	"os"
	"path/filepath"
	"strings"

	"github.com/pkg/errors"
)

type LocalStore struct {
	baseDir string
}

var _ BlobStore = (*LocalStore)(nil)

func NewLocalStore(baseDir string) *LocalStore {
	return &LocalStore{
		baseDir: strings.TrimSpace(baseDir),
	}
}

func (s *LocalStore) Save(ctx context.Context, key string, reader io.Reader) (*SavedObject, error) {
	if s == nil {
		return nil, errors.New("local store is nil")
	}
	if strings.TrimSpace(s.baseDir) == "" {
		return nil, errors.New("local store base directory is required")
	}

	cleanKey := filepath.ToSlash(strings.TrimLeft(filepath.Clean(strings.TrimSpace(key)), "/"))
	if cleanKey == "." || cleanKey == "" {
		return nil, errors.New("storage key is required")
	}

	path := filepath.Join(s.baseDir, filepath.FromSlash(cleanKey))
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return nil, errors.Wrap(err, "failed to create local upload directory")
	}

	file, err := os.Create(path)
	if err != nil {
		return nil, errors.Wrap(err, "failed to create local upload file")
	}
	defer func() { _ = file.Close() }()

	if _, err := io.Copy(file, reader); err != nil {
		return nil, errors.Wrap(err, "failed to write local upload file")
	}

	url := "/uploads/" + cleanKey

	return &SavedObject{
		StorageKey: cleanKey,
		URL:        url,
	}, nil
}
