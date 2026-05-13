package dslgoja

import (
	"database/sql"

	"github.com/go-go-golems/hair-booking/pkg/storage"
)

type RuntimeHost struct {
	DB        *sql.DB
	DBPath    string
	BlobStore storage.BlobStore
}

func (h RuntimeHost) HasDB() bool {
	return h.DB != nil
}

func WithHost(host RuntimeHost) RuntimeOption {
	return func(rt *Runtime) {
		rt.host = host
	}
}
