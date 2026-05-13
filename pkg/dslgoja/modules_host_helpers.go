package dslgoja

import (
	"time"

	"github.com/dop251/goja"
)

func userSnapshotJS(user UserSnapshot) map[string]any {
	return map[string]any{
		"authenticated": user.Authenticated,
		"id":            user.ID,
		"displayName":   user.DisplayName,
		"email":         user.Email,
		"roles":         user.Roles,
		"claims":        user.Claims,
		"sessionId":     user.SessionID,
	}
}

func uploadIntentOptionsFromCall(vm *goja.Runtime, call goja.FunctionCall) UploadIntentOptions {
	options := UploadIntentOptions{}
	if len(call.Arguments) == 0 || goja.IsUndefined(call.Argument(0)) || goja.IsNull(call.Argument(0)) {
		return options
	}
	obj := call.Argument(0).ToObject(vm)
	if value := obj.Get("purpose"); value != nil && !goja.IsUndefined(value) && !goja.IsNull(value) {
		options.Purpose = value.String()
	}
	if value := obj.Get("slot"); value != nil && !goja.IsUndefined(value) && !goja.IsNull(value) {
		options.Slot = value.String()
	}
	if value := obj.Get("maxBytes"); value != nil && !goja.IsUndefined(value) && !goja.IsNull(value) {
		options.MaxBytes = value.ToInteger()
	}
	if value := obj.Get("expiresInSeconds"); value != nil && !goja.IsUndefined(value) && !goja.IsNull(value) {
		options.ExpiresInSeconds = value.ToInteger()
	}
	if value := obj.Get("accept"); value != nil && !goja.IsUndefined(value) && !goja.IsNull(value) {
		var accept []string
		if err := vm.ExportTo(value, &accept); err == nil {
			options.Accept = accept
		}
	}
	return options
}

func uploadIntentJS(intent UploadIntent) map[string]any {
	return map[string]any{
		"uploadId":  intent.UploadID,
		"sessionId": intent.SessionID,
		"purpose":   intent.Purpose,
		"slot":      intent.Slot,
		"method":    intent.Method,
		"url":       intent.URL,
		"fieldName": intent.FieldName,
		"accept":    intent.Accept,
		"maxBytes":  intent.MaxBytes,
		"expiresAt": intent.ExpiresAt.Format(time.RFC3339Nano),
	}
}

func uploadedImageJS(image UploadedImage) map[string]any {
	return map[string]any{
		"uploadId":         image.UploadID,
		"sessionId":        image.SessionID,
		"purpose":          image.Purpose,
		"slot":             image.Slot,
		"originalFilename": image.OriginalFilename,
		"contentType":      image.ContentType,
		"sizeBytes":        image.SizeBytes,
		"storageKey":       image.StorageKey,
		"url":              image.URL,
		"createdAt":        image.CreatedAt.Format(time.RFC3339Nano),
	}
}
