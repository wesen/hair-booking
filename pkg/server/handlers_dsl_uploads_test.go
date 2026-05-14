package server

import (
	"bytes"
	"context"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"

	"github.com/go-go-golems/hair-booking/pkg/dslhost"
	hairstorage "github.com/go-go-golems/hair-booking/pkg/storage"
)

type dslUploadFakeBlobStore struct {
	objects map[string][]byte
}

func (s *dslUploadFakeBlobStore) Save(ctx context.Context, key string, reader io.Reader) (*hairstorage.SavedObject, error) {
	if s.objects == nil {
		s.objects = map[string][]byte{}
	}
	data, err := io.ReadAll(reader)
	if err != nil {
		return nil, err
	}
	s.objects[key] = data
	return &hairstorage.SavedObject{StorageKey: key, URL: "http://uploads.local/" + key}, nil
}

func TestHandleDSLUploadStoresBlobAndMetadata(t *testing.T) {
	dbHost, err := dslhost.OpenDB(context.Background(), dslhost.DBOptions{Path: filepath.Join(t.TempDir(), "dsl.sqlite"), Migrate: true})
	if err != nil {
		t.Fatalf("OpenDB: %v", err)
	}
	defer func() { _ = dbHost.Close() }()

	store := &dslUploadFakeBlobStore{}
	h := &appHandler{dslFlows: newDSLFlowStore(nil, dbHost.DB, "", dbHost.Path, store)}
	session, result, err := h.dslFlows.runtime.StartFlow(context.Background(), "test.flow", `
		const { page } = require("fringe/dsl");
		const images = require("host/images");
		function render(ctx) {
			images.createUploadIntent({ purpose: "intake-photo", slot: "front", maxBytes: 1024 });
			return page("photos", "Photos");
		}
	`)
	if err != nil {
		t.Fatalf("StartFlow: %v", err)
	}
	h.dslFlows.put(session)
	reqForUser := httptest.NewRequest(http.MethodPost, "/", nil)
	if err := h.recordDSLFlowSession(reqForUser, session, result); err != nil {
		t.Fatalf("record flow session: %v", err)
	}
	var uploadID string
	for id := range session.UploadIntents {
		uploadID = id
	}
	if uploadID == "" {
		t.Fatalf("missing upload intent")
	}

	body, contentType := multipartBody(t, "file", "front.jpg", []byte{0xff, 0xd8, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x00})
	req := httptest.NewRequest(http.MethodPost, "/api/dsl/flows/"+session.ID+"/uploads/"+uploadID, body)
	req.Header.Set("Content-Type", contentType)
	req.SetPathValue("sessionId", session.ID)
	req.SetPathValue("uploadId", uploadID)
	rec := httptest.NewRecorder()

	h.handleDSLUpload(rec, req)
	if rec.Code != http.StatusCreated {
		t.Fatalf("status = %d body=%s", rec.Code, rec.Body.String())
	}
	if len(store.objects) != 1 {
		t.Fatalf("stored objects = %d", len(store.objects))
	}
	var count int
	if err := dbHost.DB.QueryRow(`SELECT count(*) FROM dsl_uploads WHERE id = ? AND session_id = ? AND slot = 'front'`, uploadID, session.ID).Scan(&count); err != nil {
		t.Fatalf("query upload metadata: %v", err)
	}
	if count != 1 {
		t.Fatalf("metadata row count = %d", count)
	}
}

func multipartBody(t *testing.T, fieldName, filename string, data []byte) (*bytes.Buffer, string) {
	t.Helper()
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile(fieldName, filename)
	if err != nil {
		t.Fatalf("CreateFormFile: %v", err)
	}
	if _, err := part.Write(data); err != nil {
		t.Fatalf("write part: %v", err)
	}
	if err := writer.Close(); err != nil {
		t.Fatalf("close multipart: %v", err)
	}
	return body, writer.FormDataContentType()
}
