package appointments

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
)

type fakeRepository struct {
	blocks      []ScheduleBlock
	overrides   []ScheduleOverride
	booked      []Appointment
	service     *ServiceInfo
	client      *Client
	created     *Appointment
	clientCalls int
	createCalls int
}

func (f *fakeRepository) ListScheduleBlocks(ctx context.Context) ([]ScheduleBlock, error) {
	return f.blocks, nil
}

func (f *fakeRepository) ListScheduleOverrides(ctx context.Context, startDate, endDate time.Time) ([]ScheduleOverride, error) {
	return f.overrides, nil
}

func (f *fakeRepository) ListBookedAppointments(ctx context.Context, startDate, endDate time.Time) ([]Appointment, error) {
	return f.booked, nil
}

func (f *fakeRepository) GetService(ctx context.Context, serviceID uuid.UUID) (*ServiceInfo, error) {
	if f.service == nil || f.service.ID != serviceID {
		return nil, ErrNotFound
	}
	return f.service, nil
}

func (f *fakeRepository) FindOrCreateBookingClient(ctx context.Context, name, email, phone string) (*Client, error) {
	f.clientCalls++
	if f.client != nil {
		return f.client, nil
	}
	return &Client{ID: uuid.New(), Name: name, Email: email, Phone: phone}, nil
}

func (f *fakeRepository) CreateAppointment(ctx context.Context, appointment Appointment) (*Appointment, error) {
	f.createCalls++
	if appointment.ID == uuid.Nil {
		appointment.ID = uuid.New()
	}
	appointment.CreatedAt = time.Now().UTC()
	appointment.UpdatedAt = appointment.CreatedAt
	f.created = &appointment
	return &appointment, nil
}

func TestAvailabilitySubtractsBookingsAndHonorsOverrides(t *testing.T) {
	serviceID := uuid.New()
	repo := &fakeRepository{
		service: &ServiceInfo{
			ID:          serviceID,
			Name:        "Extensions Consultation",
			DurationMin: 30,
			IsActive:    true,
		},
		blocks: []ScheduleBlock{
			{DayOfWeek: 1, StartTime: "09:00", EndTime: "12:00", IsAvailable: true},
		},
		overrides: []ScheduleOverride{
			{Date: "2026-03-09", IsBlocked: true},
		},
		booked: []Appointment{
			{ID: uuid.New(), Date: "2026-03-02", StartTime: "10:00", DurationMinSnapshot: 30, Status: "confirmed"},
		},
	}

	service := NewService(repo)
	availability, err := service.Availability(context.Background(), "2026-03", &serviceID)
	if err != nil {
		t.Fatalf("Availability returned error: %v", err)
	}

	march2 := availability["2026-03-02"]
	if len(march2) == 0 {
		t.Fatal("expected availability on 2026-03-02")
	}
	for _, value := range march2 {
		if value == "10:00 AM" {
			t.Fatalf("expected booked 10:00 AM slot to be removed, got %v", march2)
		}
	}
	if _, ok := availability["2026-03-09"]; ok {
		t.Fatalf("expected blocked override date to have no availability, got %v", availability["2026-03-09"])
	}
}

func TestCreatePublicAppointmentRejectsUnavailableSlot(t *testing.T) {
	serviceID := uuid.New()
	repo := &fakeRepository{
		service: &ServiceInfo{
			ID:          serviceID,
			Name:        "Extensions Consultation",
			DurationMin: 30,
			IsActive:    true,
		},
		blocks: []ScheduleBlock{
			{DayOfWeek: 1, StartTime: "09:00", EndTime: "10:00", IsAvailable: true},
		},
	}

	service := NewService(repo)
	_, err := service.CreatePublicAppointment(context.Background(), CreatePublicAppointmentInput{
		ServiceID:   serviceID,
		Date:        "2026-03-02",
		StartTime:   "10:00 AM",
		ClientName:  "Mia Kovacs",
		ClientEmail: "mia@example.com",
	})
	if err == nil {
		t.Fatal("expected CreatePublicAppointment to reject an unavailable slot")
	}
	if !errors.Is(err, ErrSlotUnavailable) {
		t.Fatalf("expected ErrSlotUnavailable, got %v", err)
	}
	if repo.clientCalls != 0 {
		t.Fatalf("expected no client creation on unavailable slot, got %d calls", repo.clientCalls)
	}
}

func TestCreatePublicAppointmentPersistsPendingAppointment(t *testing.T) {
	serviceID := uuid.New()
	clientID := uuid.New()
	repo := &fakeRepository{
		service: &ServiceInfo{
			ID:          serviceID,
			Name:        "Extensions Consultation",
			DurationMin: 30,
			IsActive:    true,
		},
		client: &Client{ID: clientID, Name: "Mia Kovacs", Email: "mia@example.com"},
		blocks: []ScheduleBlock{
			{DayOfWeek: 1, StartTime: "09:00", EndTime: "11:00", IsAvailable: true},
		},
	}

	service := NewService(repo)
	created, err := service.CreatePublicAppointment(context.Background(), CreatePublicAppointmentInput{
		ServiceID:   serviceID,
		Date:        "2026-03-02",
		StartTime:   "10:00 AM",
		ClientName:  "Mia Kovacs",
		ClientEmail: "mia@example.com",
	})
	if err != nil {
		t.Fatalf("CreatePublicAppointment returned error: %v", err)
	}

	if created.Status != "pending" {
		t.Fatalf("expected pending status, got %q", created.Status)
	}
	if created.ClientID != clientID {
		t.Fatalf("expected client id %s, got %s", clientID, created.ClientID)
	}
	if repo.createCalls != 1 {
		t.Fatalf("expected one appointment create call, got %d", repo.createCalls)
	}
}
