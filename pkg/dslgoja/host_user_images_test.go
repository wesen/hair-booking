package dslgoja

import (
	"context"
	"strings"
	"testing"
)

func TestHostUserModuleExposesCurrentSnapshot(t *testing.T) {
	rt := NewRuntime()
	_, result, err := rt.StartFlow(context.Background(), "test.flow", `
		const { page, n } = require("fringe/dsl");
		const user = require("host/user");
		function render(ctx) {
			const current = user.current();
			if (!user.isAuthenticated()) throw new Error("expected authenticated user");
			if (!user.hasRole("client")) throw new Error("expected client role");
			return page("user", "User").add(n.text(current.id + ":" + current.sessionId).id("user"));
		}
	`, WithUser(UserSnapshot{Authenticated: true, ID: "client_1", DisplayName: "Client One", Roles: []string{"client"}}))
	if err != nil {
		t.Fatalf("StartFlow: %v", err)
	}
	if result.Page.ID != "user" {
		t.Fatalf("page id = %q", result.Page.ID)
	}
	text, _ := result.Page.Nodes[0].Props["text"].(string)
	if !strings.Contains(text, "client_1:flow_") {
		t.Fatalf("user text = %q", text)
	}
}

func TestHostImagesModuleCreatesUploadIntent(t *testing.T) {
	rt := NewRuntime()
	session, result, err := rt.StartFlow(context.Background(), "test.flow", `
		const { page, n } = require("fringe/dsl");
		const images = require("host/images");
		function render(ctx) {
			const upload = images.createUploadIntent({ purpose: "intake-photo", slot: "front", maxBytes: 1024 });
			return page("photos", "Photos").add(n.uploadTile("Front", { value: "front", upload }).id("photo-front"));
		}
	`)
	if err != nil {
		t.Fatalf("StartFlow: %v", err)
	}
	props := result.Page.Nodes[0].Props
	upload, ok := props["upload"].(map[string]any)
	if !ok {
		t.Fatalf("upload props = %#v", props["upload"])
	}
	uploadID, _ := upload["uploadId"].(string)
	if uploadID == "" {
		t.Fatalf("missing uploadId in %#v", upload)
	}
	if got := upload["url"].(string); !strings.Contains(got, "/api/dsl/flows/"+session.ID+"/uploads/") {
		t.Fatalf("upload url = %q", got)
	}
	intent, ok := session.UploadIntent(uploadID)
	if !ok {
		t.Fatalf("intent %q not registered", uploadID)
	}
	if intent.Slot != "front" || intent.MaxBytes != 1024 {
		t.Fatalf("intent = %#v", intent)
	}
}
