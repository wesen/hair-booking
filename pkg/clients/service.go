package clients

import (
	"context"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/pkg/errors"
)

var (
	ErrNotFound     = errors.New("client not found")
	ErrInvalidInput = errors.New("invalid client input")
)

type Client struct {
	ID             uuid.UUID `json:"id"`
	AuthSubject    string    `json:"auth_subject,omitempty"`
	AuthIssuer     string    `json:"auth_issuer,omitempty"`
	Name           string    `json:"name"`
	Email          string    `json:"email,omitempty"`
	Phone          string    `json:"phone,omitempty"`
	ScalpNotes     string    `json:"scalp_notes,omitempty"`
	ServiceSummary string    `json:"service_summary,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type NotificationPrefs struct {
	ClientID    uuid.UUID `json:"client_id"`
	Remind48hr  bool      `json:"remind_48hr"`
	Remind2hr   bool      `json:"remind_2hr"`
	MaintAlerts bool      `json:"maint_alerts"`
}

type AuthenticatedIdentity struct {
	Issuer      string
	Subject     string
	Email       string
	DisplayName string
}

type ProfileUpdate struct {
	Name       *string
	Email      *string
	Phone      *string
	ScalpNotes *string
}

type NotificationPrefsUpdate struct {
	Remind48hr  *bool
	Remind2hr   *bool
	MaintAlerts *bool
}

type Repository interface {
	FindByAuthIdentity(ctx context.Context, issuer, subject string) (*Client, error)
	CreateAuthenticatedClient(ctx context.Context, identity AuthenticatedIdentity) (*Client, error)
	UpdateAuthenticatedClient(ctx context.Context, clientID uuid.UUID, identity AuthenticatedIdentity) (*Client, error)
	EnsureNotificationPrefs(ctx context.Context, clientID uuid.UUID) (*NotificationPrefs, error)
	UpdateProfile(ctx context.Context, clientID uuid.UUID, update ProfileUpdate) (*Client, error)
	UpdateNotificationPrefs(ctx context.Context, clientID uuid.UUID, update NotificationPrefsUpdate) (*NotificationPrefs, error)
}

type Service struct {
	repo Repository
}

var _ interface {
	EnsureAuthenticatedClient(context.Context, AuthenticatedIdentity) (*Client, *NotificationPrefs, error)
	UpdateAuthenticatedProfile(context.Context, AuthenticatedIdentity, ProfileUpdate) (*Client, error)
	UpdateAuthenticatedNotificationPrefs(context.Context, AuthenticatedIdentity, NotificationPrefsUpdate) (*NotificationPrefs, error)
} = (*Service)(nil)

func NewService(repo Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) EnsureAuthenticatedClient(ctx context.Context, identity AuthenticatedIdentity) (*Client, *NotificationPrefs, error) {
	if s == nil || s.repo == nil {
		return nil, nil, errors.New("client service repository is not configured")
	}

	client, err := s.ensureClient(ctx, identity)
	if err != nil {
		return nil, nil, err
	}

	prefs, err := s.repo.EnsureNotificationPrefs(ctx, client.ID)
	if err != nil {
		return nil, nil, err
	}

	return client, prefs, nil
}

func (s *Service) UpdateAuthenticatedProfile(ctx context.Context, identity AuthenticatedIdentity, update ProfileUpdate) (*Client, error) {
	if s == nil || s.repo == nil {
		return nil, errors.New("client service repository is not configured")
	}

	client, err := s.ensureClient(ctx, identity)
	if err != nil {
		return nil, err
	}

	normalized := normalizeProfileUpdate(update)
	if normalized.Name != nil && *normalized.Name == "" {
		return nil, errors.Wrap(ErrInvalidInput, "name cannot be empty")
	}
	if isEmptyProfileUpdate(normalized) {
		return nil, errors.Wrap(ErrInvalidInput, "profile update payload was empty")
	}

	return s.repo.UpdateProfile(ctx, client.ID, normalized)
}

func (s *Service) UpdateAuthenticatedNotificationPrefs(ctx context.Context, identity AuthenticatedIdentity, update NotificationPrefsUpdate) (*NotificationPrefs, error) {
	if s == nil || s.repo == nil {
		return nil, errors.New("client service repository is not configured")
	}

	client, err := s.ensureClient(ctx, identity)
	if err != nil {
		return nil, err
	}
	if _, err := s.repo.EnsureNotificationPrefs(ctx, client.ID); err != nil {
		return nil, err
	}

	if isEmptyNotificationUpdate(update) {
		return nil, errors.Wrap(ErrInvalidInput, "notification preference update payload was empty")
	}

	return s.repo.UpdateNotificationPrefs(ctx, client.ID, update)
}

func (s *Service) ensureClient(ctx context.Context, identity AuthenticatedIdentity) (*Client, error) {
	identity = normalizeIdentity(identity)
	if identity.Subject == "" {
		return nil, errors.New("authenticated identity subject is required")
	}

	client, err := s.repo.FindByAuthIdentity(ctx, identity.Issuer, identity.Subject)
	if err != nil {
		if !errors.Is(err, ErrNotFound) {
			return nil, err
		}

		client, err = s.repo.CreateAuthenticatedClient(ctx, identity)
		if err != nil {
			return nil, err
		}
		return client, nil
	}

	client, err = s.repo.UpdateAuthenticatedClient(ctx, client.ID, identity)
	if err != nil {
		return nil, err
	}
	return client, nil
}

func normalizeIdentity(identity AuthenticatedIdentity) AuthenticatedIdentity {
	identity.Issuer = strings.TrimSpace(identity.Issuer)
	identity.Subject = strings.TrimSpace(identity.Subject)
	identity.Email = strings.ToLower(strings.TrimSpace(identity.Email))
	identity.DisplayName = strings.TrimSpace(identity.DisplayName)
	if identity.DisplayName == "" {
		switch {
		case identity.Email != "":
			identity.DisplayName = identity.Email
		case identity.Subject != "":
			identity.DisplayName = identity.Subject
		default:
			identity.DisplayName = "Client"
		}
	}
	return identity
}

func normalizeProfileUpdate(update ProfileUpdate) ProfileUpdate {
	if update.Name != nil {
		value := strings.TrimSpace(*update.Name)
		update.Name = &value
	}
	if update.Email != nil {
		value := strings.ToLower(strings.TrimSpace(*update.Email))
		update.Email = &value
	}
	if update.Phone != nil {
		value := strings.TrimSpace(*update.Phone)
		update.Phone = &value
	}
	if update.ScalpNotes != nil {
		value := strings.TrimSpace(*update.ScalpNotes)
		update.ScalpNotes = &value
	}
	return update
}

func isEmptyProfileUpdate(update ProfileUpdate) bool {
	return update.Name == nil && update.Email == nil && update.Phone == nil && update.ScalpNotes == nil
}

func isEmptyNotificationUpdate(update NotificationPrefsUpdate) bool {
	return update.Remind48hr == nil && update.Remind2hr == nil && update.MaintAlerts == nil
}
