package services

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/pkg/errors"
)

type PostgresRepository struct {
	pool *pgxpool.Pool
}

var _ Repository = (*PostgresRepository)(nil)

func NewPostgresRepository(pool *pgxpool.Pool) *PostgresRepository {
	return &PostgresRepository{pool: pool}
}

func (r *PostgresRepository) ListActive(ctx context.Context, category string) ([]CatalogItem, error) {
	if r == nil || r.pool == nil {
		return nil, errors.New("postgres pool is not configured")
	}

	query := `
select id, name, category, duration_min, price_low, price_high, is_active, coalesce(sort_order, 0)
from services
where is_active = true
`
	args := []any{}
	if category != "" {
		query += " and category = $1"
		args = append(args, category)
	}
	query += " order by coalesce(sort_order, 0), name"

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, errors.Wrap(err, "failed to query active services")
	}
	defer rows.Close()

	items := []CatalogItem{}
	for rows.Next() {
		var item CatalogItem
		if err := rows.Scan(
			&item.ID,
			&item.Name,
			&item.Category,
			&item.DurationMin,
			&item.PriceLow,
			&item.PriceHigh,
			&item.IsActive,
			&item.SortOrder,
		); err != nil {
			return nil, errors.Wrap(err, "failed to scan active service")
		}
		items = append(items, item)
	}

	if err := rows.Err(); err != nil {
		return nil, errors.Wrap(err, "failed while iterating active services")
	}

	return items, nil
}
