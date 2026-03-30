package config

import "testing"

func TestNormalizeSettingsAppliesDefaults(t *testing.T) {
	settings, err := NormalizeSettings(&Settings{})
	if err != nil {
		t.Fatalf("NormalizeSettings returned error: %v", err)
	}

	if settings.StorageMode != StorageModeLocal {
		t.Fatalf("expected storage mode %q, got %q", StorageModeLocal, settings.StorageMode)
	}
	if settings.StorageLocalDir != DefaultStorageLocalDir {
		t.Fatalf("expected storage dir %q, got %q", DefaultStorageLocalDir, settings.StorageLocalDir)
	}
	if settings.PublicBaseURL != DefaultPublicBaseURL {
		t.Fatalf("expected public base URL %q, got %q", DefaultPublicBaseURL, settings.PublicBaseURL)
	}
}

func TestNormalizeSettingsRejectsInvalidStorageMode(t *testing.T) {
	_, err := NormalizeSettings(&Settings{StorageMode: "ftp"})
	if err == nil {
		t.Fatal("expected NormalizeSettings to reject unsupported storage mode")
	}
}
