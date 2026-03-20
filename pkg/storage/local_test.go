package storage

import (
	"context"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestLocalStoreSave(t *testing.T) {
	dir := t.TempDir()
	store := NewLocalStore(dir, "http://127.0.0.1:8080")

	saved, err := store.Save(context.Background(), "intake/test/file.txt", strings.NewReader("hello"))
	if err != nil {
		t.Fatalf("Save returned error: %v", err)
	}

	if saved.URL != "http://127.0.0.1:8080/uploads/intake/test/file.txt" {
		t.Fatalf("unexpected URL %q", saved.URL)
	}

	contents, err := os.ReadFile(filepath.Join(dir, "intake", "test", "file.txt"))
	if err != nil {
		t.Fatalf("failed to read saved file: %v", err)
	}
	if string(contents) != "hello" {
		t.Fatalf("expected saved contents hello, got %q", string(contents))
	}
}
