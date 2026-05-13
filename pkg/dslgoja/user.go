package dslgoja

import "strings"

type UserSnapshot struct {
	Authenticated bool              `json:"authenticated"`
	ID            string            `json:"id"`
	DisplayName   string            `json:"displayName"`
	Email         string            `json:"email,omitempty"`
	Roles         []string          `json:"roles"`
	Claims        map[string]string `json:"claims,omitempty"`
	SessionID     string            `json:"sessionId"`
}

func (u UserSnapshot) WithSessionID(sessionID string) UserSnapshot {
	u.SessionID = sessionID
	if u.ID == "" {
		u.ID = "anon:" + sessionID
	}
	if u.DisplayName == "" {
		u.DisplayName = "Guest"
	}
	if u.Roles == nil {
		u.Roles = []string{}
	}
	return u
}

func (u UserSnapshot) HasRole(role string) bool {
	role = strings.TrimSpace(role)
	if role == "" {
		return false
	}
	for _, candidate := range u.Roles {
		if candidate == role {
			return true
		}
	}
	return false
}

type StartFlowOptions struct {
	User UserSnapshot
}

type StartFlowOption func(*StartFlowOptions)

func WithUser(user UserSnapshot) StartFlowOption {
	return func(options *StartFlowOptions) {
		options.User = user
	}
}
