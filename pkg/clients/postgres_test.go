package clients

import "testing"

func TestNullableStringPointer(t *testing.T) {
	t.Run("nil pointer becomes nil", func(t *testing.T) {
		value := nullableStringPointer(nil)
		if value != nil {
			t.Fatalf("expected nil, got %#v", value)
		}
	})

	t.Run("string pointer becomes concrete string", func(t *testing.T) {
		input := "alice@example.com"
		value := nullableStringPointer(&input)
		asString, ok := value.(string)
		if !ok {
			t.Fatalf("expected string, got %T", value)
		}
		if asString != input {
			t.Fatalf("expected %q, got %q", input, asString)
		}
	})
}
