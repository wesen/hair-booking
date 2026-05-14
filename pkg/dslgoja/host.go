package dslgoja

import (
	"database/sql"

	"github.com/go-go-golems/hair-booking/pkg/storage"
)

type RuntimeHost struct {
	// DB/DBPath are the legacy single-database fields. New code should prefer
	// StateDB/StateDBPath and ConfigDB/ConfigDBPath, but keeping these fields
	// lets older tests and callers continue to map require("db") to the state DB
	// during the HAIR-038 transition.
	DB     *sql.DB
	DBPath string

	// ConfigDB is the pre-provisioned read-only database object exposed to Goja
	// as require("configDb"). It is intended for app configuration/content.
	ConfigDB     *sql.DB
	ConfigDBPath string

	// StateDB is the pre-provisioned read-write database object exposed to Goja
	// as require("stateDb"). It is intended for DSL sessions, state snapshots,
	// drafts, uploads, preferences, and app-managed durable rows.
	StateDB     *sql.DB
	StateDBPath string

	BlobStore storage.BlobStore
}

func (h RuntimeHost) EffectiveStateDB() *sql.DB {
	if h.StateDB != nil {
		return h.StateDB
	}
	return h.DB
}

func (h RuntimeHost) EffectiveStateDBPath() string {
	if h.StateDBPath != "" {
		return h.StateDBPath
	}
	return h.DBPath
}

func (h RuntimeHost) HasDB() bool {
	return h.EffectiveStateDB() != nil
}

func (h RuntimeHost) HasStateDB() bool {
	return h.EffectiveStateDB() != nil
}

func (h RuntimeHost) HasConfigDB() bool {
	return h.ConfigDB != nil
}

func WithHost(host RuntimeHost) RuntimeOption {
	return func(rt *Runtime) {
		rt.host = host
	}
}
