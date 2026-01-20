package server

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"

	"github.com/rs/zerolog"

	"github.com/go-go-golems/sbcap/internal/store"
)

const testDSL = `name: Test
root: cuts
nodes:
  cuts:
    question: "Pick a cut"
    options:
      - label: "Men's Cut"
        price: 5500
        duration: 45min
        next: end
  end:
    type: terminal
    action: book_appointment
`

func TestDecisionTreeFlow(t *testing.T) {
	st, err := store.Open(":memory:")
	if err != nil {
		t.Fatalf("store open: %v", err)
	}
	defer func() { _ = st.Close() }()

	srv := New(st, zerolog.Nop())
	ts := httptest.NewServer(srv.Handler())
	defer ts.Close()

	validatePayload := map[string]string{"dslContent": testDSL}
	validateResp := map[string]any{}
	postJSON(t, ts.URL+"/api/decision-trees/validate", validatePayload, &validateResp)
	if valid, ok := validateResp["valid"].(bool); !ok || !valid {
		t.Fatalf("expected valid response, got %+v", validateResp)
	}
	if issues, ok := validateResp["issues"].([]any); ok && len(issues) != 0 {
		t.Fatalf("expected no issues, got %+v", validateResp)
	}

	createPayload := map[string]any{
		"name":        "Test",
		"dslContent":  testDSL,
		"isPublished": true,
	}
	createResp := map[string]any{}
	postJSON(t, ts.URL+"/api/decision-trees", createPayload, &createResp)
	id, ok := createResp["id"].(float64)
	if !ok || id == 0 {
		t.Fatalf("expected id, got %+v", createResp)
	}

	getResp := map[string]any{}
	getJSON(t, ts.URL+"/api/decision-trees/"+strconv.FormatInt(int64(id), 10), &getResp)
	if getResp["name"].(string) != "Test" {
		t.Fatalf("unexpected name %+v", getResp)
	}

	bookingPayload := map[string]any{
		"decisionTreeId":   int64(id),
		"selectedServices": "[]",
		"totalPrice":       5500,
		"totalDuration":    45,
	}
	bookingResp := map[string]any{}
	postJSON(t, ts.URL+"/api/bookings", bookingPayload, &bookingResp)
	if bookingResp["id"] == nil {
		t.Fatalf("expected booking id, got %+v", bookingResp)
	}
}

func postJSON(t *testing.T, url string, payload any, out any) {
	data, err := json.Marshal(payload)
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}

	resp, err := http.Post(url, "application/json", bytes.NewReader(data))
	if err != nil {
		t.Fatalf("post: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		t.Fatalf("status %d", resp.StatusCode)
	}
	if out == nil {
		return
	}
	if err := json.NewDecoder(resp.Body).Decode(out); err != nil {
		t.Fatalf("decode: %v", err)
	}
}

func getJSON(t *testing.T, url string, out any) {
	resp, err := http.Get(url)
	if err != nil {
		t.Fatalf("get: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		t.Fatalf("status %d", resp.StatusCode)
	}
	if err := json.NewDecoder(resp.Body).Decode(out); err != nil {
		t.Fatalf("decode: %v", err)
	}
}
