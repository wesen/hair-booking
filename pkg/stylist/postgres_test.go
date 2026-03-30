package stylist

import (
	"database/sql"
	"testing"

	"github.com/google/uuid"
)

func TestParseOptionalUUIDReturnsNilForNullOrBlankValues(t *testing.T) {
	for _, value := range []sql.NullString{
		{},
		{Valid: true, String: ""},
		{Valid: true, String: "   "},
	} {
		parsed, err := parseOptionalUUID(value)
		if err != nil {
			t.Fatalf("parseOptionalUUID returned error: %v", err)
		}
		if parsed != nil {
			t.Fatalf("expected nil parsed UUID for %#v, got %s", value, parsed.String())
		}
	}
}

func TestParseOptionalUUIDParsesValidValue(t *testing.T) {
	expected := uuid.New()

	parsed, err := parseOptionalUUID(sql.NullString{Valid: true, String: expected.String()})
	if err != nil {
		t.Fatalf("parseOptionalUUID returned error: %v", err)
	}
	if parsed == nil {
		t.Fatal("expected parsed UUID")
	}
	if *parsed != expected {
		t.Fatalf("expected %s, got %s", expected, *parsed)
	}
}

func TestParseOptionalUUIDRejectsInvalidValue(t *testing.T) {
	if _, err := parseOptionalUUID(sql.NullString{Valid: true, String: "not-a-uuid"}); err == nil {
		t.Fatal("expected parseOptionalUUID to reject invalid UUIDs")
	}
}
