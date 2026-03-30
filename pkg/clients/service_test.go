package clients

import (
	"context"
	"testing"

	"github.com/google/uuid"
)

type fakeRepository struct {
	findResult    *Client
	findErr       error
	created       *Client
	updated       *Client
	prefs         *NotificationPrefs
	profile       *Client
	updatedPrefs  *NotificationPrefs
	createInput   AuthenticatedIdentity
	updateInput   AuthenticatedIdentity
	profileUpdate ProfileUpdate
	prefsUpdate   NotificationPrefsUpdate
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

func (f *fakeRepository) UpdateProfile(ctx context.Context, clientID uuid.UUID, update ProfileUpdate) (*Client, error) {
	f.profileUpdate = update
	return f.profile, nil
}

func (f *fakeRepository) UpdateNotificationPrefs(ctx context.Context, clientID uuid.UUID, update NotificationPrefsUpdate) (*NotificationPrefs, error) {
	f.prefsUpdate = update
	return f.updatedPrefs, nil
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

func TestUpdateAuthenticatedProfileUsesExistingClient(t *testing.T) {
	name := "Mia Kovacs"
	scalpNotes := "Sensitive scalp"
	repo := &fakeRepository{
		findResult: &Client{ID: uuid.New(), Name: "Old"},
		updated:    &Client{ID: uuid.New(), Name: "Old"},
		profile:    &Client{ID: uuid.New(), Name: "Mia Kovacs", ScalpNotes: scalpNotes},
	}

	service := NewService(repo)
	client, err := service.UpdateAuthenticatedProfile(context.Background(), AuthenticatedIdentity{
		Issuer:  "issuer",
		Subject: "subject",
	}, ProfileUpdate{
		Name:       &name,
		ScalpNotes: &scalpNotes,
	})
	if err != nil {
		t.Fatalf("UpdateAuthenticatedProfile returned error: %v", err)
	}

	if client.Name != "Mia Kovacs" {
		t.Fatalf("expected updated client name, got %q", client.Name)
	}
	if repo.profileUpdate.Name == nil || *repo.profileUpdate.Name != "Mia Kovacs" {
		t.Fatalf("expected profile update to include normalized name, got %#v", repo.profileUpdate.Name)
	}
}

func TestUpdateAuthenticatedNotificationPrefs(t *testing.T) {
	remind2hr := false
	repo := &fakeRepository{
		findResult:   &Client{ID: uuid.New(), Name: "Mia"},
		updated:      &Client{ID: uuid.New(), Name: "Mia"},
		prefs:        &NotificationPrefs{Remind48hr: true, Remind2hr: true, MaintAlerts: true},
		updatedPrefs: &NotificationPrefs{Remind48hr: true, Remind2hr: false, MaintAlerts: true},
	}

	service := NewService(repo)
	prefs, err := service.UpdateAuthenticatedNotificationPrefs(context.Background(), AuthenticatedIdentity{
		Issuer:  "issuer",
		Subject: "subject",
	}, NotificationPrefsUpdate{
		Remind2hr: &remind2hr,
	})
	if err != nil {
		t.Fatalf("UpdateAuthenticatedNotificationPrefs returned error: %v", err)
	}

	if prefs.Remind2hr {
		t.Fatalf("expected remind_2hr to be false, got %#v", prefs)
	}
	if repo.prefsUpdate.Remind2hr == nil || *repo.prefsUpdate.Remind2hr {
		t.Fatalf("expected preference update to be recorded, got %#v", repo.prefsUpdate)
	}
}
