package dslgoja

import (
	"context"
	"path/filepath"
	"testing"

	"github.com/go-go-golems/hair-booking/pkg/dslhost"
)

func newRuntimeWithConfigDB(t *testing.T) *Runtime {
	t.Helper()
	host, err := dslhost.OpenConfigDB(context.Background(), dslhost.DBOptions{Path: filepath.Join(t.TempDir(), "config.sqlite"), Migrate: true})
	if err != nil {
		t.Fatalf("OpenConfigDB: %v", err)
	}
	t.Cleanup(func() { _ = host.Close() })
	return NewRuntime(WithHost(RuntimeHost{ConfigDB: host.DB, ConfigDBPath: host.Path}))
}
