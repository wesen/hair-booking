package clients

import (
	"context"
	"testing"

	"github.com/google/uuid"
)

type fakeRepository struct {
	findResult  *Client
	findErr     error
	created     *Client
	updated     *Client
	prefs       *NotificationPrefs
	createInput AuthenticatedIdentity
	updateInput AuthenticatedIdentity
}

func (f *fakeRepository) FindByAuthIdentity(ctx context.Context, issuer, subject string) (*Client, error) {
	return f.findResult, f.findErr
}

func (f *fakeRepository) CreateAuthenticatedClient(ctx context.Context, identity AuthenticatedIdentity) (*Client, error) {
	f.createInput = identity
	return f.created, nil
}

func (f *fakeRepository) UpdateAuthenticatedClient(ctx context.Context, clientID uuid.UUID, identity AuthenticatedIdentity) (*Client, error) {
	f.updateInput = identity
	return f.updated, nil
}

func (f *fakeRepository) EnsureNotificationPrefs(ctx context.Context, clientID uuid.UUID) (*NotificationPrefs, error) {
	return f.prefs, nil
}

func TestEnsureAuthenticatedClientCreatesMissingClient(t *testing.T) {
	repo := &fakeRepository{
		findErr: ErrNotFound,
		created: &Client{ID: uuid.New(), Name: "Alice"},
		prefs:   &NotificationPrefs{Remind48hr: true, Remind2hr: true, MaintAlerts: true},
	}

	service := NewService(repo)
	client, prefs, err := service.EnsureAuthenticatedClient(context.Background(), AuthenticatedIdentity{
		Issuer:      "issuer",
		Subject:     "subject",
		Email:       "ALICE@EXAMPLE.COM",
		DisplayName: "Alice",
	})
	if err != nil {
		t.Fatalf("EnsureAuthenticatedClient returned error: %v", err)
	}

	if client.Name != "Alice" {
		t.Fatalf("expected client name Alice, got %q", client.Name)
	}
	if prefs == nil || !prefs.Remind48hr {
		t.Fatal("expected notification preferences to be returned")
	}
	if repo.createInput.Email != "alice@example.com" {
		t.Fatalf("expected normalized email alice@example.com, got %q", repo.createInput.Email)
	}
}

func TestEnsureAuthenticatedClientUpdatesExistingClient(t *testing.T) {
	repo := &fakeRepository{
		findResult: &Client{ID: uuid.New(), Name: "Old"},
		updated:    &Client{ID: uuid.New(), Name: "New"},
		prefs:      &NotificationPrefs{Remind48hr: true, Remind2hr: true, MaintAlerts: true},
	}

	service := NewService(repo)
	client, _, err := service.EnsureAuthenticatedClient(context.Background(), AuthenticatedIdentity{
		Issuer:  "issuer",
		Subject: "subject",
		Email:   "new@example.com",
	})
	if err != nil {
		t.Fatalf("EnsureAuthenticatedClient returned error: %v", err)
	}

	if client.Name != "New" {
		t.Fatalf("expected updated client name New, got %q", client.Name)
	}
	if repo.updateInput.DisplayName != "new@example.com" {
		t.Fatalf("expected derived display name from email, got %q", repo.updateInput.DisplayName)
	}
}
