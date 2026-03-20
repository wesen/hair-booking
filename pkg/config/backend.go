package config

import (
	"os"
	"strings"

	"github.com/go-go-golems/glazed/pkg/cmds/fields"
	"github.com/go-go-golems/glazed/pkg/cmds/schema"
	"github.com/go-go-golems/glazed/pkg/cmds/values"
	"github.com/pkg/errors"
)

const (
	BackendSectionSlug     = "backend"
	StorageModeLocal       = "local"
	StorageModeS3          = "s3"
	DefaultStorageLocalDir = "./var/uploads"
	DefaultPublicBaseURL   = "http://127.0.0.1:8080"
	DefaultAutoMigrate     = true
)

type Settings struct {
	DatabaseURL     string `glazed:"database-url"`
	StorageMode     string `glazed:"storage-mode"`
	StorageLocalDir string `glazed:"storage-local-dir"`
	PublicBaseURL   string `glazed:"public-base-url"`
	AutoMigrate     bool   `glazed:"auto-migrate"`
}

func NewSection() (schema.Section, error) {
	return schema.NewSection(
		BackendSectionSlug,
		"Backend Settings",
		schema.WithFields(
			fields.New(
				"database-url",
				fields.TypeString,
				fields.WithHelp("PostgreSQL connection string for the application database"),
				fields.WithDefault(strings.TrimSpace(os.Getenv("HAIR_BOOKING_DATABASE_URL"))),
			),
			fields.New(
				"storage-mode",
				fields.TypeChoice,
				fields.WithChoices(StorageModeLocal, StorageModeS3),
				fields.WithHelp("Blob storage backend mode"),
				fields.WithDefault(envOr("HAIR_BOOKING_STORAGE_MODE", StorageModeLocal)),
			),
			fields.New(
				"storage-local-dir",
				fields.TypeString,
				fields.WithHelp("Directory used for local upload storage"),
				fields.WithDefault(envOr("HAIR_BOOKING_STORAGE_LOCAL_DIR", DefaultStorageLocalDir)),
			),
			fields.New(
				"public-base-url",
				fields.TypeString,
				fields.WithHelp("Base URL used to build public upload URLs"),
				fields.WithDefault(envOr("HAIR_BOOKING_PUBLIC_BASE_URL", DefaultPublicBaseURL)),
			),
			fields.New(
				"auto-migrate",
				fields.TypeBool,
				fields.WithHelp("Apply embedded SQL migrations automatically on startup when a database URL is configured"),
				fields.WithDefault(envBoolOr("HAIR_BOOKING_AUTO_MIGRATE", DefaultAutoMigrate)),
			),
		),
	)
}

func LoadSettingsFromParsedValues(parsedValues *values.Values) (*Settings, error) {
	if parsedValues == nil {
		return nil, errors.New("parsed values are nil")
	}

	settings := &Settings{}
	if err := parsedValues.DecodeSectionInto(BackendSectionSlug, settings); err != nil {
		return nil, errors.Wrap(err, "failed to decode backend section")
	}

	return NormalizeSettings(settings)
}

func NormalizeSettings(settings *Settings) (*Settings, error) {
	if settings == nil {
		settings = &Settings{}
	}

	settings.DatabaseURL = strings.TrimSpace(settings.DatabaseURL)
	settings.StorageMode = strings.ToLower(strings.TrimSpace(settings.StorageMode))
	if settings.StorageMode == "" {
		settings.StorageMode = StorageModeLocal
	}
	if settings.StorageMode != StorageModeLocal && settings.StorageMode != StorageModeS3 {
		return nil, errors.Errorf("unsupported storage mode %q", settings.StorageMode)
	}

	settings.StorageLocalDir = strings.TrimSpace(settings.StorageLocalDir)
	if settings.StorageLocalDir == "" {
		settings.StorageLocalDir = DefaultStorageLocalDir
	}

	settings.PublicBaseURL = strings.TrimSpace(settings.PublicBaseURL)
	if settings.PublicBaseURL == "" {
		settings.PublicBaseURL = DefaultPublicBaseURL
	}

	return settings, nil
}

func envOr(key, fallback string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	return value
}

func envBoolOr(key string, fallback bool) bool {
	value := strings.TrimSpace(strings.ToLower(os.Getenv(key)))
	switch value {
	case "1", "true", "yes", "on":
		return true
	case "0", "false", "no", "off":
		return false
	default:
		return fallback
	}
}
