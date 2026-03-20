package stylist

import (
	"context"
	"testing"
	"time"

	hairappointments "github.com/go-go-golems/hair-booking/pkg/appointments"
	hairclients "github.com/go-go-golems/hair-booking/pkg/clients"
	hairintake "github.com/go-go-golems/hair-booking/pkg/intake"
	"github.com/google/uuid"
)

type fakeRepository struct {
	items                 []IntakeListItem
	detail                *IntakeDetail
	upserted              *IntakeReview
	intakeStats           *DashboardIntakeStats
	appointments          []DashboardAppointment
	appointmentRows       []Appointment
	appointmentDetail     *AppointmentDetail
	updatedAppointment    *Appointment
	clientRows            []ClientListItem
	clientDetail          *ClientDetail
	listFilter            IntakeListFilter
	appointmentListFilter AppointmentListFilter
	clientListFilter      ClientListFilter
	lastUpdate            IntakeReviewUpdate
	lastAppointmentUpdate AppointmentUpdate
	lastIntakeID          uuid.UUID
	lastAppointmentID     uuid.UUID
	lastClientID          uuid.UUID
	lastNow               time.Time
}

func (f *fakeRepository) ListIntakes(ctx context.Context, filter IntakeListFilter) ([]IntakeListItem, error) {
	f.listFilter = filter
	return f.items, nil
}

func (f *fakeRepository) GetIntake(ctx context.Context, intakeID uuid.UUID) (*IntakeDetail, error) {
	f.lastIntakeID = intakeID
	return f.detail, nil
}

func (f *fakeRepository) UpsertIntakeReview(ctx context.Context, intakeID uuid.UUID, update IntakeReviewUpdate, reviewedAt time.Time) (*IntakeReview, error) {
	f.lastIntakeID = intakeID
	f.lastUpdate = update
	f.lastNow = reviewedAt
	if f.upserted != nil {
		return f.upserted, nil
	}
	return &IntakeReview{
		ID:       uuid.New(),
		IntakeID: intakeID,
		Status:   ReviewStatusInReview,
		Priority: ReviewPriorityNormal,
	}, nil
}

func (f *fakeRepository) GetDashboardIntakeStats(ctx context.Context) (*DashboardIntakeStats, error) {
	return f.intakeStats, nil
}

func (f *fakeRepository) ListDashboardAppointments(ctx context.Context, startDate time.Time, limit int) ([]DashboardAppointment, error) {
	return f.appointments, nil
}

func (f *fakeRepository) ListAppointments(ctx context.Context, filter AppointmentListFilter) ([]Appointment, error) {
	f.appointmentListFilter = filter
	return f.appointmentRows, nil
}

func (f *fakeRepository) GetAppointment(ctx context.Context, appointmentID uuid.UUID) (*AppointmentDetail, error) {
	f.lastAppointmentID = appointmentID
	return f.appointmentDetail, nil
}

func (f *fakeRepository) UpdateAppointment(ctx context.Context, appointmentID uuid.UUID, update AppointmentUpdate, updatedAt time.Time) (*Appointment, error) {
	f.lastAppointmentID = appointmentID
	f.lastAppointmentUpdate = update
	f.lastNow = updatedAt
	if f.updatedAppointment != nil {
		return f.updatedAppointment, nil
	}
	return &Appointment{
		ID:     appointmentID,
		Status: "confirmed",
	}, nil
}

func (f *fakeRepository) ListClients(ctx context.Context, filter ClientListFilter) ([]ClientListItem, error) {
	f.clientListFilter = filter
	return f.clientRows, nil
}

func (f *fakeRepository) GetClient(ctx context.Context, clientID uuid.UUID) (*ClientDetail, error) {
	f.lastClientID = clientID
	return f.clientDetail, nil
}

func TestListIntakesNormalizesFilterDefaults(t *testing.T) {
	repo := &fakeRepository{}
	service := NewService(repo)

	_, err := service.ListIntakes(context.Background(), IntakeListFilter{})
	if err != nil {
		t.Fatalf("ListIntakes returned error: %v", err)
	}

	if repo.listFilter.Limit != defaultListLimit {
		t.Fatalf("expected default list limit %d, got %d", defaultListLimit, repo.listFilter.Limit)
	}
	if repo.listFilter.Offset != 0 {
		t.Fatalf("expected default offset 0, got %d", repo.listFilter.Offset)
	}
}

func TestListIntakesRejectsUnknownStatus(t *testing.T) {
	service := NewService(&fakeRepository{})

	_, err := service.ListIntakes(context.Background(), IntakeListFilter{Status: "mystery"})
	if err == nil {
		t.Fatal("expected ListIntakes to reject invalid status")
	}
}

func TestGetIntakeAddsDefaultReviewValues(t *testing.T) {
	intakeID := uuid.New()
	repo := &fakeRepository{
		detail: &IntakeDetail{
			Submission: &hairintake.Submission{
				ID:          intakeID,
				ServiceType: "extensions",
			},
			Client: &hairclients.Client{Name: "Alice"},
			Photos: []hairintake.Photo{},
		},
	}
	service := NewService(repo)

	detail, err := service.GetIntake(context.Background(), intakeID)
	if err != nil {
		t.Fatalf("GetIntake returned error: %v", err)
	}

	if detail.Review.Status != ReviewStatusNew {
		t.Fatalf("expected default review status %q, got %q", ReviewStatusNew, detail.Review.Status)
	}
	if detail.Review.Priority != ReviewPriorityNormal {
		t.Fatalf("expected default review priority %q, got %q", ReviewPriorityNormal, detail.Review.Priority)
	}
	if detail.Photos == nil {
		t.Fatal("expected intake photos slice to be initialized")
	}
}

func TestGetAppointmentInitializesPhotos(t *testing.T) {
	appointmentID := uuid.New()
	repo := &fakeRepository{
		appointmentDetail: &AppointmentDetail{
			Appointment: &Appointment{
				ID:     appointmentID,
				Status: "pending",
			},
		},
	}
	service := NewService(repo)

	detail, err := service.GetAppointment(context.Background(), appointmentID)
	if err != nil {
		t.Fatalf("GetAppointment returned error: %v", err)
	}

	if detail.Photos == nil {
		t.Fatal("expected appointment photos slice to be initialized")
	}
}

func TestUpdateIntakeReviewRejectsReversedQuoteRange(t *testing.T) {
	service := NewService(&fakeRepository{})
	low := 1800
	high := 1200

	_, err := service.UpdateIntakeReview(context.Background(), uuid.New(), IntakeReviewUpdate{
		QuotedPriceLow:  &low,
		QuotedPriceHigh: &high,
	})
	if err == nil {
		t.Fatal("expected UpdateIntakeReview to reject reversed quote range")
	}
}

func TestUpdateIntakeReviewNormalizesEnumValues(t *testing.T) {
	repo := &fakeRepository{}
	service := NewService(repo)
	now := time.Date(2026, time.March, 20, 16, 0, 0, 0, time.UTC)
	service.now = func() time.Time { return now }

	status := " In_Review "
	priority := " URGENT "
	summary := "  Needs longer consult  "
	internalNotes := "  Ask about bleach history  "

	_, err := service.UpdateIntakeReview(context.Background(), uuid.New(), IntakeReviewUpdate{
		Status:        &status,
		Priority:      &priority,
		Summary:       &summary,
		InternalNotes: &internalNotes,
	})
	if err != nil {
		t.Fatalf("UpdateIntakeReview returned error: %v", err)
	}

	if repo.lastUpdate.Status == nil || *repo.lastUpdate.Status != ReviewStatusInReview {
		t.Fatalf("expected normalized status %q, got %#v", ReviewStatusInReview, repo.lastUpdate.Status)
	}
	if repo.lastUpdate.Priority == nil || *repo.lastUpdate.Priority != ReviewPriorityUrgent {
		t.Fatalf("expected normalized priority %q, got %#v", ReviewPriorityUrgent, repo.lastUpdate.Priority)
	}
	if repo.lastUpdate.Summary == nil || *repo.lastUpdate.Summary != "Needs longer consult" {
		t.Fatalf("expected trimmed summary, got %#v", repo.lastUpdate.Summary)
	}
	if repo.lastUpdate.InternalNotes == nil || *repo.lastUpdate.InternalNotes != "Ask about bleach history" {
		t.Fatalf("expected trimmed internal notes, got %#v", repo.lastUpdate.InternalNotes)
	}
	if !repo.lastNow.Equal(now) {
		t.Fatalf("expected review timestamp %s, got %s", now, repo.lastNow)
	}
}

func TestDashboardPartitionsTodayAndUpcomingAppointments(t *testing.T) {
	repo := &fakeRepository{
		intakeStats: &DashboardIntakeStats{
			NewCount:      2,
			InReviewCount: 1,
		},
		appointments: []DashboardAppointment{
			{
				AppointmentID: uuid.New(),
				Date:          "2026-03-20",
				StartTime:     "09:00 AM",
				ClientName:    "Alice Example",
				ServiceName:   "Extensions Consultation",
				Status:        "pending",
			},
			{
				AppointmentID: uuid.New(),
				Date:          "2026-03-22",
				StartTime:     "10:00 AM",
				ClientName:    "Mia Chen",
				ServiceName:   "Tape-In Install",
				Status:        "confirmed",
			},
		},
	}
	service := NewService(repo)
	service.now = func() time.Time {
		return time.Date(2026, time.March, 20, 15, 0, 0, 0, time.UTC)
	}

	dashboard, err := service.Dashboard(context.Background())
	if err != nil {
		t.Fatalf("Dashboard returned error: %v", err)
	}

	if dashboard.TodayAppointments != 1 {
		t.Fatalf("expected 1 today appointment, got %d", dashboard.TodayAppointments)
	}
	if len(dashboard.TodaySchedule) != 1 {
		t.Fatalf("expected 1 today schedule item, got %d", len(dashboard.TodaySchedule))
	}
	if len(dashboard.UpcomingAppointments) != 1 {
		t.Fatalf("expected 1 upcoming appointment, got %d", len(dashboard.UpcomingAppointments))
	}
	if dashboard.Intakes.NewCount != 2 {
		t.Fatalf("expected new intake count 2, got %d", dashboard.Intakes.NewCount)
	}
}

func TestListAppointmentsNormalizesFilterDefaults(t *testing.T) {
	repo := &fakeRepository{}
	service := NewService(repo)

	_, err := service.ListAppointments(context.Background(), AppointmentListFilter{})
	if err != nil {
		t.Fatalf("ListAppointments returned error: %v", err)
	}

	if repo.appointmentListFilter.Limit != defaultListLimit {
		t.Fatalf("expected default list limit %d, got %d", defaultListLimit, repo.appointmentListFilter.Limit)
	}
}

func TestUpdateAppointmentRejectsUnknownStatus(t *testing.T) {
	service := NewService(&fakeRepository{})
	status := "mystery"

	_, err := service.UpdateAppointment(context.Background(), uuid.New(), AppointmentUpdate{Status: &status})
	if err == nil {
		t.Fatal("expected UpdateAppointment to reject invalid status")
	}
}

func TestUpdateAppointmentNormalizesNotes(t *testing.T) {
	repo := &fakeRepository{}
	service := NewService(repo)
	now := time.Date(2026, time.March, 20, 18, 0, 0, 0, time.UTC)
	service.now = func() time.Time { return now }

	status := " confirmed "
	prepNotes := "  Bring color swatches  "
	stylistNotes := "  Allocate extra blending time  "

	_, err := service.UpdateAppointment(context.Background(), uuid.New(), AppointmentUpdate{
		Status:       &status,
		PrepNotes:    &prepNotes,
		StylistNotes: &stylistNotes,
	})
	if err != nil {
		t.Fatalf("UpdateAppointment returned error: %v", err)
	}

	if repo.lastAppointmentUpdate.Status == nil || *repo.lastAppointmentUpdate.Status != "confirmed" {
		t.Fatalf("expected normalized status, got %#v", repo.lastAppointmentUpdate.Status)
	}
	if repo.lastAppointmentUpdate.PrepNotes == nil || *repo.lastAppointmentUpdate.PrepNotes != "Bring color swatches" {
		t.Fatalf("expected trimmed prep notes, got %#v", repo.lastAppointmentUpdate.PrepNotes)
	}
	if repo.lastAppointmentUpdate.StylistNotes == nil || *repo.lastAppointmentUpdate.StylistNotes != "Allocate extra blending time" {
		t.Fatalf("expected trimmed stylist notes, got %#v", repo.lastAppointmentUpdate.StylistNotes)
	}
	if !repo.lastNow.Equal(now) {
		t.Fatalf("expected update time %s, got %s", now, repo.lastNow)
	}
}

func TestListClientsNormalizesFilterDefaults(t *testing.T) {
	repo := &fakeRepository{}
	service := NewService(repo)

	_, err := service.ListClients(context.Background(), ClientListFilter{Search: "  alice  "})
	if err != nil {
		t.Fatalf("ListClients returned error: %v", err)
	}

	if repo.clientListFilter.Search != "alice" {
		t.Fatalf("expected trimmed search, got %q", repo.clientListFilter.Search)
	}
	if repo.clientListFilter.Limit != defaultListLimit {
		t.Fatalf("expected default list limit %d, got %d", defaultListLimit, repo.clientListFilter.Limit)
	}
}

func TestGetClientRequiresValidClientPayload(t *testing.T) {
	service := NewService(&fakeRepository{})

	_, err := service.GetClient(context.Background(), uuid.New())
	if err == nil {
		t.Fatal("expected GetClient to reject missing client detail")
	}
}

func TestGetClientNormalizesNestedCollections(t *testing.T) {
	clientID := uuid.New()
	intakeID := uuid.New()
	repo := &fakeRepository{
		clientDetail: &ClientDetail{
			Client: &hairclients.Client{
				ID:   clientID,
				Name: "Alice Example",
			},
			RecentIntakes: []ClientIntakeSummary{{
				ID:          intakeID,
				ServiceType: "extensions",
			}},
			MaintenancePlan: &hairappointments.MaintenancePlan{
				ID:       uuid.New(),
				ClientID: clientID,
			},
		},
	}
	service := NewService(repo)

	detail, err := service.GetClient(context.Background(), clientID)
	if err != nil {
		t.Fatalf("GetClient returned error: %v", err)
	}

	if detail.RecentIntakes[0].Review.Status != ReviewStatusNew {
		t.Fatalf("expected default intake review status %q, got %q", ReviewStatusNew, detail.RecentIntakes[0].Review.Status)
	}
	if detail.MaintenanceItems == nil {
		t.Fatal("expected maintenance items slice to be initialized")
	}
	if repo.lastClientID != clientID {
		t.Fatalf("expected repo to receive client id %s, got %s", clientID, repo.lastClientID)
	}
}
