package appointments

import (
	"database/sql"
	"errors"
	"testing"

	"github.com/google/uuid"
)

type fakeBookingClientScanner struct {
	id    uuid.UUID
	name  string
	email sql.NullString
	phone sql.NullString
	err   error
}

func (f fakeBookingClientScanner) Scan(dest ...any) error {
	if f.err != nil {
		return f.err
	}
	if len(dest) != 4 {
		return errors.New("unexpected scan destination count")
	}
	*(dest[0].(*uuid.UUID)) = f.id
	*(dest[1].(*string)) = f.name
	*(dest[2].(*sql.NullString)) = f.email
	*(dest[3].(*sql.NullString)) = f.phone
	return nil
}

func TestScanBookingClientHandlesNullEmailAndPhone(t *testing.T) {
	id := uuid.New()
	client, err := scanBookingClient(fakeBookingClientScanner{
		id:    id,
		name:  "Mia Kovacs",
		email: sql.NullString{},
		phone: sql.NullString{},
	})
	if err != nil {
		t.Fatalf("scanBookingClient returned error: %v", err)
	}
	if client.ID != id {
		t.Fatalf("expected id %s, got %s", id, client.ID)
	}
	if client.Name != "Mia Kovacs" {
		t.Fatalf("expected name Mia Kovacs, got %q", client.Name)
	}
	if client.Email != "" {
		t.Fatalf("expected empty email, got %q", client.Email)
	}
	if client.Phone != "" {
		t.Fatalf("expected empty phone, got %q", client.Phone)
	}
}

func TestScanBookingClientPreservesConcreteEmailAndPhone(t *testing.T) {
	client, err := scanBookingClient(fakeBookingClientScanner{
		id:   uuid.New(),
		name: "Mia Kovacs",
		email: sql.NullString{
			String: "mia@example.com",
			Valid:  true,
		},
		phone: sql.NullString{
			String: "555-111-2222",
			Valid:  true,
		},
	})
	if err != nil {
		t.Fatalf("scanBookingClient returned error: %v", err)
	}
	if client.Email != "mia@example.com" {
		t.Fatalf("expected email mia@example.com, got %q", client.Email)
	}
	if client.Phone != "555-111-2222" {
		t.Fatalf("expected phone 555-111-2222, got %q", client.Phone)
	}
}
