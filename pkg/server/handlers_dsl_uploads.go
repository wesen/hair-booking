package server

import (
	"bytes"
	"fmt"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/go-go-golems/hair-booking/pkg/dslgoja"
	"github.com/google/uuid"
)

type dslUploadResponse struct {
	UploadID         string `json:"uploadId"`
	SessionID        string `json:"sessionId"`
	Purpose          string `json:"purpose"`
	Slot             string `json:"slot,omitempty"`
	OriginalFilename string `json:"originalFilename,omitempty"`
	ContentType      string `json:"contentType,omitempty"`
	SizeBytes        int64  `json:"sizeBytes"`
	StorageKey       string `json:"storageKey"`
	URL              string `json:"url"`
}

func (h *appHandler) dslUserSnapshot(r *http.Request) dslgoja.UserSnapshot {
	if h == nil || h.authSettings == nil {
		return dslgoja.UserSnapshot{Authenticated: false, DisplayName: "Guest", Roles: []string{}}
	}
	claims, ok := h.currentClaims(r)
	if !ok || claims == nil {
		return dslgoja.UserSnapshot{Authenticated: false, DisplayName: "Guest", Roles: []string{}}
	}
	id := strings.TrimSpace(claims.Subject)
	if id == "" {
		id = strings.TrimSpace(claims.PreferredUsername)
	}
	displayName := strings.TrimSpace(claims.DisplayName)
	if displayName == "" {
		displayName = strings.TrimSpace(claims.PreferredUsername)
	}
	if displayName == "" {
		displayName = "Guest"
	}
	return dslgoja.UserSnapshot{
		Authenticated: true,
		ID:            id,
		DisplayName:   displayName,
		Email:         strings.TrimSpace(claims.Email),
		Roles:         append([]string(nil), claims.Scopes...),
		Claims: map[string]string{
			"issuer":   strings.TrimSpace(claims.Issuer),
			"subject":  strings.TrimSpace(claims.Subject),
			"username": strings.TrimSpace(claims.PreferredUsername),
		},
	}
}

func (h *appHandler) recordDSLFlowSession(r *http.Request, session *dslgoja.FlowSession, result *dslgoja.InteractionResult) error {
	if h.dslFlows == nil || h.dslFlows.stateDB == nil || session == nil || result == nil {
		return nil
	}
	stateJSON, err := session.StateJSON()
	if err != nil {
		return err
	}
	_, err = h.dslFlows.stateDB.ExecContext(r.Context(), `INSERT INTO dsl_flow_sessions(id, flow_id, user_id, status, current_page_id, current_page_version, state_json)
VALUES (?, ?, ?, 'active', ?, ?, ?)
ON CONFLICT(id) DO UPDATE SET current_page_id = excluded.current_page_id, current_page_version = excluded.current_page_version, state_json = excluded.state_json, updated_at = datetime('now')`,
		session.ID,
		session.FlowID,
		h.dslUserSnapshot(r).ID,
		result.Page.ID,
		result.PageVersion,
		string(stateJSON),
	)
	return err
}

func (h *appHandler) handleDSLUpload(w http.ResponseWriter, r *http.Request) {
	sessionID := r.PathValue("sessionId")
	uploadID := r.PathValue("uploadId")
	session, ok := h.dslFlows.get(sessionID)
	if !ok {
		writeDSLProtoError(w, http.StatusNotFound, "dsl_session_not_found", "DSL session not found")
		return
	}
	intent, ok := session.UploadIntent(uploadID)
	if !ok {
		writeDSLProtoError(w, http.StatusNotFound, "dsl_upload_intent_not_found", "DSL upload intent not found")
		return
	}
	if h.dslFlows.blobStore == nil {
		writeDSLProtoError(w, http.StatusInternalServerError, "dsl_upload_storage_not_configured", "DSL upload storage is not configured")
		return
	}

	if err := r.ParseMultipartForm(intent.MaxBytes); err != nil {
		writeDSLProtoError(w, http.StatusBadRequest, "invalid_dsl_upload_form", "Request body must be multipart/form-data")
		return
	}
	file, header, err := r.FormFile(intent.FieldName)
	if err != nil {
		writeDSLProtoError(w, http.StatusBadRequest, "missing_dsl_upload_file", "A file upload is required")
		return
	}
	defer func() { _ = file.Close() }()

	reader, err := readValidatedPhotoUpload(file, header)
	if err != nil {
		writeDSLProtoError(w, http.StatusBadRequest, "invalid_dsl_upload_file", err.Error())
		return
	}
	data := make([]byte, reader.Size())
	if _, err := reader.ReadAt(data, 0); err != nil {
		writeDSLProtoError(w, http.StatusBadRequest, "invalid_dsl_upload_file", "Failed to read validated upload")
		return
	}
	if int64(len(data)) > intent.MaxBytes {
		writeDSLProtoError(w, http.StatusBadRequest, "dsl_upload_too_large", fmt.Sprintf("Uploaded file must be %d bytes or smaller", intent.MaxBytes))
		return
	}
	contentType := http.DetectContentType(data)
	if !uploadContentTypeAllowed(contentType, intent.Accept) {
		writeDSLProtoError(w, http.StatusBadRequest, "invalid_dsl_upload_content_type", "Uploaded file content type is not allowed")
		return
	}

	key := filepath.ToSlash(filepath.Join("dsl", sessionID, uploadID, sanitizeUploadFilename(header.Filename)))
	saved, err := h.dslFlows.blobStore.Save(r.Context(), key, bytes.NewReader(data))
	if err != nil {
		writeDSLProtoError(w, http.StatusInternalServerError, "dsl_upload_save_failed", err.Error())
		return
	}
	image, err := session.CompleteUpload(uploadID, dslgoja.CompleteUploadInput{
		OriginalFilename: header.Filename,
		ContentType:      contentType,
		SizeBytes:        int64(len(data)),
		StorageKey:       saved.StorageKey,
		URL:              saved.URL,
	})
	if err != nil {
		writeDSLProtoError(w, http.StatusBadRequest, "dsl_upload_complete_failed", err.Error())
		return
	}
	if err := h.recordDSLUpload(r, image); err != nil {
		writeDSLProtoError(w, http.StatusInternalServerError, "dsl_upload_record_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, dslUploadResponse{
		UploadID:         image.UploadID,
		SessionID:        image.SessionID,
		Purpose:          image.Purpose,
		Slot:             image.Slot,
		OriginalFilename: image.OriginalFilename,
		ContentType:      image.ContentType,
		SizeBytes:        image.SizeBytes,
		StorageKey:       image.StorageKey,
		URL:              image.URL,
	})
}

func (h *appHandler) recordDSLUpload(r *http.Request, image dslgoja.UploadedImage) error {
	if h.dslFlows.stateDB == nil {
		return nil
	}
	_, err := h.dslFlows.stateDB.ExecContext(r.Context(), `INSERT INTO dsl_uploads(id, session_id, user_id, purpose, slot, original_filename, content_type, size_bytes, storage_key, public_url, status)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'stored')`,
		image.UploadID,
		image.SessionID,
		h.dslUserSnapshot(r).ID,
		image.Purpose,
		image.Slot,
		image.OriginalFilename,
		image.ContentType,
		image.SizeBytes,
		image.StorageKey,
		image.URL,
	)
	return err
}

func uploadContentTypeAllowed(contentType string, accept []string) bool {
	contentType = strings.ToLower(strings.TrimSpace(contentType))
	for _, candidate := range accept {
		if contentType == strings.ToLower(strings.TrimSpace(candidate)) {
			return true
		}
	}
	return false
}

func sanitizeUploadFilename(name string) string {
	name = strings.TrimSpace(filepath.Base(name))
	if name == "" || name == "." || name == string(filepath.Separator) {
		return uuid.NewString()
	}
	return name
}
