package clients

import (
	"context"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/pkg/errors"
)

var ErrNotFound = errors.New("client not found")

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

type Repository interface {
	FindByAuthIdentity(ctx context.Context, issuer, subject string) (*Client, error)
	CreateAuthenticatedClient(ctx context.Context, identity AuthenticatedIdentity) (*Client, error)
	UpdateAuthenticatedClient(ctx context.Context, clientID uuid.UUID, identity AuthenticatedIdentity) (*Client, error)
	EnsureNotificationPrefs(ctx context.Context, clientID uuid.UUID) (*NotificationPrefs, error)
}

type Service struct {
	repo Repository
}

var _ interface {
	EnsureAuthenticatedClient(context.Context, AuthenticatedIdentity) (*Client, *NotificationPrefs, error)
} = (*Service)(nil)

func NewService(repo Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) EnsureAuthenticatedClient(ctx context.Context, identity AuthenticatedIdentity) (*Client, *NotificationPrefs, error) {
	if s == nil || s.repo == nil {
		return nil, nil, errors.New("client service repository is not configured")
	}

	identity = normalizeIdentity(identity)
	if identity.Subject == "" {
		return nil, nil, errors.New("authenticated identity subject is required")
	}

	client, err := s.repo.FindByAuthIdentity(ctx, identity.Issuer, identity.Subject)
	if err != nil {
		if !errors.Is(err, ErrNotFound) {
			return nil, nil, err
		}

		client, err = s.repo.CreateAuthenticatedClient(ctx, identity)
		if err != nil {
			return nil, nil, err
		}
	} else {
		client, err = s.repo.UpdateAuthenticatedClient(ctx, client.ID, identity)
		if err != nil {
			return nil, nil, err
		}
	}

	prefs, err := s.repo.EnsureNotificationPrefs(ctx, client.ID)
	if err != nil {
		return nil, nil, err
	}

	return client, prefs, nil
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
