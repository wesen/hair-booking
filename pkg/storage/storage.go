package storage

import (
	"context"
	"io"
)

type SavedObject struct {
	StorageKey string
	URL        string
}

type BlobStore interface {
	Save(ctx context.Context, key string, reader io.Reader) (*SavedObject, error)
}
