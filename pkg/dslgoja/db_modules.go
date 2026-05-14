package dslgoja

import (
	"database/sql"
	"fmt"
	"strings"
)

type queryOnlyDB struct {
	db *sql.DB
}

func newQueryOnlyDB(db *sql.DB) queryOnlyDB {
	return queryOnlyDB{db: db}
}

func (q queryOnlyDB) Query(query string, args ...any) (*sql.Rows, error) {
	if q.db == nil {
		return nil, fmt.Errorf("configDb is not configured")
	}
	if !looksLikeReadOnlySQL(query) {
		return nil, fmt.Errorf("configDb only allows SELECT or WITH queries")
	}
	return q.db.Query(query, args...)
}

func (q queryOnlyDB) Exec(query string, args ...any) (sql.Result, error) {
	return nil, fmt.Errorf("configDb is read-only")
}

func looksLikeReadOnlySQL(query string) bool {
	trimmed := strings.TrimSpace(query)
	for {
		lower := strings.ToLower(trimmed)
		switch {
		case strings.HasPrefix(lower, "--"):
			if idx := strings.Index(trimmed, "\n"); idx >= 0 {
				trimmed = strings.TrimSpace(trimmed[idx+1:])
				continue
			}
			return false
		case strings.HasPrefix(lower, "/*"):
			if idx := strings.Index(lower, "*/"); idx >= 0 {
				trimmed = strings.TrimSpace(trimmed[idx+2:])
				continue
			}
			return false
		default:
			return strings.HasPrefix(lower, "select") || strings.HasPrefix(lower, "with")
		}
	}
}
