package appointments

import (
	"context"
	"fmt"
	"sort"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/pkg/errors"
)

var (
	ErrInvalidInput    = errors.New("invalid appointment input")
	ErrNotFound        = errors.New("appointment resource not found")
	ErrSlotUnavailable = errors.New("appointment slot unavailable")
)

const (
	defaultAvailabilityDurationMin = 30
	slotStepMin                    = 30
)

type ScheduleBlock struct {
	DayOfWeek   int    `json:"day_of_week"`
	StartTime   string `json:"start_time"`
	EndTime     string `json:"end_time"`
	IsAvailable bool   `json:"is_available"`
}

type ScheduleOverride struct {
	Date      string `json:"date"`
	IsBlocked bool   `json:"is_blocked"`
	StartTime string `json:"start_time,omitempty"`
	EndTime   string `json:"end_time,omitempty"`
}

type ServiceInfo struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Category    string    `json:"category"`
	DurationMin int       `json:"duration_min"`
	PriceLow    int       `json:"price_low"`
	PriceHigh   int       `json:"price_high"`
	IsActive    bool      `json:"is_active"`
}

type Appointment struct {
	ID                  uuid.UUID  `json:"id"`
	ClientID            uuid.UUID  `json:"client_id"`
	ServiceID           uuid.UUID  `json:"service_id"`
	IntakeID            *uuid.UUID `json:"intake_id,omitempty"`
	Date                string     `json:"date"`
	StartTime           string     `json:"start_time"`
	DurationMinSnapshot int        `json:"duration_min_snapshot"`
	Status              string     `json:"status"`
	CreatedAt           time.Time  `json:"created_at"`
	UpdatedAt           time.Time  `json:"updated_at"`
}

type Client struct {
	ID    uuid.UUID `json:"id"`
	Name  string    `json:"name"`
	Email string    `json:"email,omitempty"`
	Phone string    `json:"phone,omitempty"`
}

type CreatePublicAppointmentInput struct {
	IntakeID    *uuid.UUID
	ServiceID   uuid.UUID
	Date        string
	StartTime   string
	ClientName  string
	ClientEmail string
	ClientPhone string
}

type Repository interface {
	ListScheduleBlocks(ctx context.Context) ([]ScheduleBlock, error)
	ListScheduleOverrides(ctx context.Context, startDate, endDate time.Time) ([]ScheduleOverride, error)
	ListBookedAppointments(ctx context.Context, startDate, endDate time.Time) ([]Appointment, error)
	GetService(ctx context.Context, serviceID uuid.UUID) (*ServiceInfo, error)
	FindOrCreateBookingClient(ctx context.Context, name, email, phone string) (*Client, error)
	CreateAppointment(ctx context.Context, appointment Appointment) (*Appointment, error)
}

type Service struct {
	repo Repository
}

func NewService(repo Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) Availability(ctx context.Context, month string, serviceID *uuid.UUID) (map[string][]string, error) {
	if s == nil || s.repo == nil {
		return nil, errors.New("appointments repository is not configured")
	}

	startDate, endDate, err := parseMonth(month)
	if err != nil {
		return nil, err
	}

	durationMin := defaultAvailabilityDurationMin
	if serviceID != nil && *serviceID != uuid.Nil {
		service, err := s.repo.GetService(ctx, *serviceID)
		if err != nil {
			return nil, err
		}
		if !service.IsActive {
			return nil, errors.Wrap(ErrNotFound, "service is not active")
		}
		durationMin = service.DurationMin
	}

	blocks, err := s.repo.ListScheduleBlocks(ctx)
	if err != nil {
		return nil, err
	}
	overrides, err := s.repo.ListScheduleOverrides(ctx, startDate, endDate.AddDate(0, 0, -1))
	if err != nil {
		return nil, err
	}
	booked, err := s.repo.ListBookedAppointments(ctx, startDate, endDate.AddDate(0, 0, -1))
	if err != nil {
		return nil, err
	}

	return computeAvailability(startDate, endDate, durationMin, blocks, overrides, booked)
}

func (s *Service) CreatePublicAppointment(ctx context.Context, input CreatePublicAppointmentInput) (*Appointment, error) {
	if s == nil || s.repo == nil {
		return nil, errors.New("appointments repository is not configured")
	}

	normalized, dateValue, startMinute, err := normalizeCreateInput(input)
	if err != nil {
		return nil, err
	}

	service, err := s.repo.GetService(ctx, normalized.ServiceID)
	if err != nil {
		return nil, err
	}
	if !service.IsActive {
		return nil, errors.Wrap(ErrNotFound, "service is not active")
	}

	monthStart := time.Date(dateValue.Year(), dateValue.Month(), 1, 0, 0, 0, 0, time.UTC)
	monthEnd := monthStart.AddDate(0, 1, 0)
	blocks, err := s.repo.ListScheduleBlocks(ctx)
	if err != nil {
		return nil, err
	}
	overrides, err := s.repo.ListScheduleOverrides(ctx, monthStart, monthEnd.AddDate(0, 0, -1))
	if err != nil {
		return nil, err
	}
	booked, err := s.repo.ListBookedAppointments(ctx, monthStart, monthEnd.AddDate(0, 0, -1))
	if err != nil {
		return nil, err
	}

	available, err := computeAvailabilityForDate(dateValue, service.DurationMin, blocks, overrides, booked)
	if err != nil {
		return nil, err
	}
	if !containsMinute(available, startMinute) {
		return nil, errors.Wrap(ErrSlotUnavailable, "requested date/time is not currently available")
	}

	client, err := s.repo.FindOrCreateBookingClient(ctx, normalized.ClientName, normalized.ClientEmail, normalized.ClientPhone)
	if err != nil {
		return nil, err
	}

	appointment := Appointment{
		ClientID:            client.ID,
		ServiceID:           normalized.ServiceID,
		IntakeID:            normalized.IntakeID,
		Date:                dateValue.Format(time.DateOnly),
		StartTime:           formatDisplayMinute(startMinute),
		DurationMinSnapshot: service.DurationMin,
		Status:              "pending",
	}

	return s.repo.CreateAppointment(ctx, appointment)
}

func normalizeCreateInput(input CreatePublicAppointmentInput) (CreatePublicAppointmentInput, time.Time, int, error) {
	input.ClientName = strings.TrimSpace(input.ClientName)
	input.ClientEmail = strings.ToLower(strings.TrimSpace(input.ClientEmail))
	input.ClientPhone = strings.TrimSpace(input.ClientPhone)
	input.Date = strings.TrimSpace(input.Date)
	input.StartTime = strings.TrimSpace(input.StartTime)

	switch {
	case input.ServiceID == uuid.Nil:
		return input, time.Time{}, 0, errors.Wrap(ErrInvalidInput, "service_id is required")
	case input.ClientName == "":
		return input, time.Time{}, 0, errors.Wrap(ErrInvalidInput, "client_name is required")
	case input.ClientEmail == "" && input.ClientPhone == "":
		return input, time.Time{}, 0, errors.Wrap(ErrInvalidInput, "client_email or client_phone is required")
	case input.Date == "":
		return input, time.Time{}, 0, errors.Wrap(ErrInvalidInput, "date is required")
	case input.StartTime == "":
		return input, time.Time{}, 0, errors.Wrap(ErrInvalidInput, "start_time is required")
	}

	dateValue, err := time.ParseInLocation(time.DateOnly, input.Date, time.UTC)
	if err != nil {
		return input, time.Time{}, 0, errors.Wrap(ErrInvalidInput, "date must be in YYYY-MM-DD format")
	}

	startMinute, err := parseMinuteOfDay(input.StartTime)
	if err != nil {
		return input, time.Time{}, 0, err
	}

	return input, dateValue, startMinute, nil
}

func computeAvailability(startDate, endDate time.Time, durationMin int, blocks []ScheduleBlock, overrides []ScheduleOverride, booked []Appointment) (map[string][]string, error) {
	availability := map[string][]string{}

	for dateValue := startDate; dateValue.Before(endDate); dateValue = dateValue.AddDate(0, 0, 1) {
		starts, err := computeAvailabilityForDate(dateValue, durationMin, blocks, overrides, booked)
		if err != nil {
			return nil, err
		}
		if len(starts) == 0 {
			continue
		}

		key := dateValue.Format(time.DateOnly)
		values := make([]string, 0, len(starts))
		for _, minute := range starts {
			values = append(values, formatDisplayMinute(minute))
		}
		availability[key] = values
	}

	return availability, nil
}

func computeAvailabilityForDate(dateValue time.Time, durationMin int, blocks []ScheduleBlock, overrides []ScheduleOverride, booked []Appointment) ([]int, error) {
	weekday := int(dateValue.Weekday())
	availableWindows := []timeWindow{}
	unavailableWindows := []timeWindow{}

	for _, block := range blocks {
		if block.DayOfWeek != weekday {
			continue
		}
		window, err := windowFromTimes(block.StartTime, block.EndTime)
		if err != nil {
			return nil, err
		}
		if block.IsAvailable {
			availableWindows = append(availableWindows, window)
		} else {
			unavailableWindows = append(unavailableWindows, window)
		}
	}

	windows := subtractWindows(normalizeWindows(availableWindows), normalizeWindows(unavailableWindows))

	overrideByDate, err := overridesIndex(overrides)
	if err != nil {
		return nil, err
	}
	if override, ok := overrideByDate[dateValue.Format(time.DateOnly)]; ok {
		if override.IsBlocked {
			return nil, nil
		}
		if strings.TrimSpace(override.StartTime) != "" && strings.TrimSpace(override.EndTime) != "" {
			window, err := windowFromTimes(override.StartTime, override.EndTime)
			if err != nil {
				return nil, err
			}
			windows = []timeWindow{window}
		}
	}

	bookedByDate, err := bookingsIndex(booked)
	if err != nil {
		return nil, err
	}
	windows = subtractWindows(windows, bookedByDate[dateValue.Format(time.DateOnly)])

	starts := []int{}
	for _, window := range windows {
		for startMinute := window.Start; startMinute+durationMin <= window.End; startMinute += slotStepMin {
			starts = append(starts, startMinute)
		}
	}

	sort.Ints(starts)
	return starts, nil
}

func parseMonth(month string) (time.Time, time.Time, error) {
	month = strings.TrimSpace(month)
	if month == "" {
		return time.Time{}, time.Time{}, errors.Wrap(ErrInvalidInput, "month is required")
	}
	startDate, err := time.ParseInLocation("2006-01", month, time.UTC)
	if err != nil {
		return time.Time{}, time.Time{}, errors.Wrap(ErrInvalidInput, "month must be in YYYY-MM format")
	}
	return startDate, startDate.AddDate(0, 1, 0), nil
}

func parseMinuteOfDay(value string) (int, error) {
	value = strings.TrimSpace(value)
	if value == "" {
		return 0, errors.Wrap(ErrInvalidInput, "time value is required")
	}

	layouts := []string{
		"15:04",
		"15:04:05",
		"3:04 PM",
		"3 PM",
	}
	for _, layout := range layouts {
		if parsed, err := time.Parse(layout, value); err == nil {
			return parsed.Hour()*60 + parsed.Minute(), nil
		}
	}

	return 0, errors.Wrapf(ErrInvalidInput, "time %q must be in HH:MM or h:mm AM/PM format", value)
}

func formatDisplayMinute(minute int) string {
	value := time.Date(2000, 1, 1, minute/60, minute%60, 0, 0, time.UTC)
	return value.Format("3:04 PM")
}

type timeWindow struct {
	Start int
	End   int
}

func windowFromTimes(startValue, endValue string) (timeWindow, error) {
	startMinute, err := parseMinuteOfDay(startValue)
	if err != nil {
		return timeWindow{}, err
	}
	endMinute, err := parseMinuteOfDay(endValue)
	if err != nil {
		return timeWindow{}, err
	}
	if endMinute <= startMinute {
		return timeWindow{}, errors.Wrapf(ErrInvalidInput, "end time %q must be after start time %q", endValue, startValue)
	}
	return timeWindow{Start: startMinute, End: endMinute}, nil
}

func normalizeWindows(windows []timeWindow) []timeWindow {
	if len(windows) == 0 {
		return nil
	}

	sorted := append([]timeWindow(nil), windows...)
	sort.Slice(sorted, func(i, j int) bool {
		if sorted[i].Start == sorted[j].Start {
			return sorted[i].End < sorted[j].End
		}
		return sorted[i].Start < sorted[j].Start
	})

	merged := []timeWindow{sorted[0]}
	for _, window := range sorted[1:] {
		last := &merged[len(merged)-1]
		if window.Start <= last.End {
			if window.End > last.End {
				last.End = window.End
			}
			continue
		}
		merged = append(merged, window)
	}
	return merged
}

func subtractWindows(base []timeWindow, blocked []timeWindow) []timeWindow {
	if len(base) == 0 {
		return nil
	}
	if len(blocked) == 0 {
		return append([]timeWindow(nil), base...)
	}

	remaining := append([]timeWindow(nil), base...)
	for _, block := range normalizeWindows(blocked) {
		next := make([]timeWindow, 0, len(remaining))
		for _, window := range remaining {
			switch {
			case block.End <= window.Start || block.Start >= window.End:
				next = append(next, window)
			case block.Start <= window.Start && block.End >= window.End:
				continue
			case block.Start <= window.Start:
				next = append(next, timeWindow{Start: block.End, End: window.End})
			case block.End >= window.End:
				next = append(next, timeWindow{Start: window.Start, End: block.Start})
			default:
				next = append(next,
					timeWindow{Start: window.Start, End: block.Start},
					timeWindow{Start: block.End, End: window.End},
				)
			}
		}
		remaining = next
	}

	return normalizeWindows(remaining)
}

func overridesIndex(overrides []ScheduleOverride) (map[string]ScheduleOverride, error) {
	index := map[string]ScheduleOverride{}
	for _, override := range overrides {
		dateKey := strings.TrimSpace(override.Date)
		if _, err := time.ParseInLocation(time.DateOnly, dateKey, time.UTC); err != nil {
			return nil, errors.Wrapf(ErrInvalidInput, "override date %q must be in YYYY-MM-DD format", override.Date)
		}
		index[dateKey] = override
	}
	return index, nil
}

func bookingsIndex(booked []Appointment) (map[string][]timeWindow, error) {
	index := map[string][]timeWindow{}
	for _, appointment := range booked {
		if strings.EqualFold(strings.TrimSpace(appointment.Status), "cancelled") {
			continue
		}
		dateKey := strings.TrimSpace(appointment.Date)
		if _, err := time.ParseInLocation(time.DateOnly, dateKey, time.UTC); err != nil {
			return nil, errors.Wrapf(ErrInvalidInput, "appointment date %q must be in YYYY-MM-DD format", appointment.Date)
		}
		startMinute, err := parseMinuteOfDay(appointment.StartTime)
		if err != nil {
			return nil, err
		}
		if appointment.DurationMinSnapshot <= 0 {
			return nil, errors.Wrapf(ErrInvalidInput, "appointment %s must have a positive duration snapshot", appointment.ID)
		}
		index[dateKey] = append(index[dateKey], timeWindow{
			Start: startMinute,
			End:   startMinute + appointment.DurationMinSnapshot,
		})
	}
	for dateKey := range index {
		index[dateKey] = normalizeWindows(index[dateKey])
	}
	return index, nil
}

func containsMinute(values []int, target int) bool {
	for _, value := range values {
		if value == target {
			return true
		}
	}
	return false
}

func (a Appointment) String() string {
	return fmt.Sprintf("%s %s", a.Date, a.StartTime)
}
