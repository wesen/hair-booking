import type {
  ClientDto,
  DashboardAppointmentDto,
  IntakePhotoDto,
  IntakeReviewDto,
  IntakeSubmissionDto,
  MaintenancePlanItemDto,
  StylistAppointmentDetailDto,
  StylistAppointmentDto,
  StylistClientAppointmentSummaryDto,
  StylistClientDetailDto,
  StylistClientIntakeSummaryDto,
  StylistClientListItemDto,
  StylistDashboardDto,
  StylistIntakeDetailDto,
  StylistIntakeListItemDto,
} from "./types";
import { getApiErrorMessage } from "./base";
import {
  type GetStylistAppointmentsArgs,
  type GetStylistClientsArgs,
  type GetStylistIntakesArgs,
  useGetStylistAppointmentQuery,
  useGetStylistAppointmentsQuery,
  useGetStylistClientQuery,
  useGetStylistClientsQuery,
  useGetStylistDashboardQuery,
  useGetStylistIntakeQuery,
  useGetStylistIntakesQuery,
} from "./stylistApi";

export interface StylistSummaryCardView {
  label: string;
  value: number;
}

export interface StylistListRowView {
  id: string;
  title: string;
  meta: string;
  badge?: string;
}

export interface StylistKeyValueView {
  label: string;
  value: string;
}

export interface StylistReviewFormDefaults {
  status: string;
  priority: string;
  summary: string;
  internalNotes: string;
  quotedPriceLow: string;
  quotedPriceHigh: string;
}

export interface StylistAppointmentFormDefaults {
  status: string;
  prepNotes: string;
  stylistNotes: string;
}

export interface StylistDashboardViewModel {
  summaryCards: StylistSummaryCardView[];
  todayRows: StylistListRowView[];
  upcomingRows: StylistListRowView[];
}

export interface StylistIntakeListRowView extends StylistListRowView {
  status: string;
  priority: string;
}

export interface StylistIntakeDetailViewModel {
  summaryItems: StylistKeyValueView[];
  photoRows: StylistListRowView[];
  reviewDefaults: StylistReviewFormDefaults;
}

export interface StylistAppointmentListRowView extends StylistListRowView {
  status: string;
  date: string;
  clientName: string;
}

export interface StylistAppointmentDetailViewModel {
  summaryItems: StylistKeyValueView[];
  formDefaults: StylistAppointmentFormDefaults;
  linkedIntakeRow: StylistListRowView | null;
}

export interface StylistClientListRowView extends StylistListRowView {}

export interface StylistClientDetailViewModel {
  summaryItems: StylistKeyValueView[];
  recentAppointmentRows: StylistListRowView[];
  recentIntakeRows: StylistListRowView[];
  maintenanceRows: StylistListRowView[];
}

function formatDateLabel(value?: string | null): string {
  if (!value) {
    return "Not set";
  }
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatCurrencyRange(low?: number | null, high?: number | null): string {
  const lowValue = typeof low === "number" ? low : 0;
  const highValue = typeof high === "number" ? high : 0;
  return `$${lowValue}-$${highValue}`;
}

function displayClientName(client?: Pick<ClientDto, "name"> | null, fallback = "Guest intake"): string {
  return client?.name?.trim() || fallback;
}

function createListRow(id: string, title: string, meta: string, badge?: string): StylistListRowView {
  return { id, title, meta, ...(badge ? { badge } : {}) };
}

function mapDashboardAppointmentRow(appointment: DashboardAppointmentDto): StylistListRowView {
  const metaParts = [appointment.service_name];
  if (appointment.date) {
    metaParts.push(formatDateLabel(appointment.date));
  }
  metaParts.push(appointment.start_time);
  return createListRow(appointment.appointment_id, appointment.client_name, metaParts.join(" · "), appointment.status);
}

function mapReviewDefaults(review: IntakeReviewDto): StylistReviewFormDefaults {
  return {
    status: review.status || "new",
    priority: review.priority || "normal",
    summary: review.summary || "",
    internalNotes: review.internal_notes || "",
    quotedPriceLow: typeof review.quoted_price_low === "number" ? String(review.quoted_price_low) : "",
    quotedPriceHigh: typeof review.quoted_price_high === "number" ? String(review.quoted_price_high) : "",
  };
}

function mapAppointmentFormDefaults(appointment: StylistAppointmentDto): StylistAppointmentFormDefaults {
  return {
    status: appointment.status || "pending",
    prepNotes: appointment.prep_notes || "",
    stylistNotes: appointment.stylist_notes || "",
  };
}

function mapIntakeListRow(intake: StylistIntakeListItemDto): StylistIntakeListRowView {
  return {
    ...createListRow(
      intake.id,
      displayClientName(intake.client),
      `${intake.service_type} · ${intake.review.status} · ${formatDateLabel(intake.submitted_at)}`,
      intake.review.priority,
    ),
    status: intake.review.status,
    priority: intake.review.priority,
  };
}

function mapIntakePhotoRow(photo: IntakePhotoDto): StylistListRowView {
  return createListRow(photo.id, photo.slot, photo.url);
}

function mapIntakeDetailView(intake: StylistIntakeDetailDto): StylistIntakeDetailViewModel {
  return {
    summaryItems: [
      { label: "Client", value: displayClientName(intake.client) },
      { label: "Service Type", value: intake.submission.service_type },
      { label: "Budget", value: intake.submission.budget || "Not provided" },
      { label: "Dream Result", value: intake.submission.dream_result || "Not provided" },
      { label: "Estimate", value: formatCurrencyRange(intake.submission.estimate_low, intake.submission.estimate_high) },
      { label: "Review Status", value: intake.review.status },
      { label: "Priority", value: intake.review.priority },
    ],
    photoRows: intake.photos.map(mapIntakePhotoRow),
    reviewDefaults: mapReviewDefaults(intake.review),
  };
}

function mapAppointmentListRow(appointment: StylistAppointmentDto): StylistAppointmentListRowView {
  return {
    ...createListRow(
      appointment.id,
      appointment.client_name,
      `${appointment.service_name} · ${formatDateLabel(appointment.date)} · ${appointment.start_time}`,
      appointment.status,
    ),
    status: appointment.status,
    date: appointment.date,
    clientName: appointment.client_name,
  };
}

function mapAppointmentDetailView(detail: StylistAppointmentDetailDto): StylistAppointmentDetailViewModel {
  return {
    summaryItems: [
      { label: "Client", value: displayClientName(detail.client, detail.appointment.client_name) },
      { label: "Service", value: detail.appointment.service_name },
      { label: "Date", value: formatDateLabel(detail.appointment.date) },
      { label: "Time", value: detail.appointment.start_time },
      { label: "Status", value: detail.appointment.status },
      { label: "Prep Notes", value: detail.appointment.prep_notes || "None yet" },
      { label: "Stylist Notes", value: detail.appointment.stylist_notes || "None yet" },
    ],
    formDefaults: mapAppointmentFormDefaults(detail.appointment),
    linkedIntakeRow: detail.intake?.id
      ? createListRow(
          detail.intake.id,
          detail.intake.service_type,
          detail.intake.dream_result || "No dream-result note",
        )
      : null,
  };
}

function mapClientListRow(client: StylistClientListItemDto): StylistClientListRowView {
  return createListRow(
    client.id,
    client.name,
    `${client.appointment_count} appointments · ${client.intake_count} intakes`,
    client.last_review_status || undefined,
  );
}

function mapClientAppointmentRow(appointment: StylistClientAppointmentSummaryDto): StylistListRowView {
  return createListRow(
    appointment.id,
    appointment.service_name,
    `${formatDateLabel(appointment.date)} · ${appointment.start_time} · ${appointment.status}`,
  );
}

function mapClientIntakeRow(intake: StylistClientIntakeSummaryDto): StylistListRowView {
  return createListRow(
    intake.id,
    intake.service_type,
    `${intake.review.status} · ${formatDateLabel(intake.submitted_at)} · ${intake.photo_count} photos`,
  );
}

function mapMaintenanceRow(item: MaintenancePlanItemDto): StylistListRowView {
  return createListRow(item.id, item.service_name, `${formatDateLabel(item.due_date)} · ${item.status}`);
}

function mapClientDetailView(client: StylistClientDetailDto): StylistClientDetailViewModel {
  return {
    summaryItems: [
      { label: "Name", value: client.client.name },
      { label: "Email", value: client.client.email || "Not set" },
      { label: "Phone", value: client.client.phone || "Not set" },
      { label: "Appointments", value: String(client.appointment_count) },
      { label: "Intakes", value: String(client.intake_count) },
      { label: "Service Summary", value: client.client.service_summary || client.client.scalp_notes || "No notes yet" },
    ],
    recentAppointmentRows: client.recent_appointments.map(mapClientAppointmentRow),
    recentIntakeRows: client.recent_intakes.map(mapClientIntakeRow),
    maintenanceRows: client.maintenance_items.map(mapMaintenanceRow),
  };
}

export function useStylistDashboardView() {
  const query = useGetStylistDashboardQuery();
  const dashboard = query.data ?? null;
  return {
    dashboard,
    view: dashboard
      ? ({
          summaryCards: [
            { label: "New Intakes", value: dashboard.intakes.new_count },
            { label: "In Review", value: dashboard.intakes.in_review_count },
            { label: "Needs Reply", value: dashboard.intakes.needs_client_reply_count },
            { label: "Today", value: dashboard.today_appointments },
          ],
          todayRows: dashboard.today_schedule.map(mapDashboardAppointmentRow),
          upcomingRows: dashboard.upcoming_appointments.map(mapDashboardAppointmentRow),
        } satisfies StylistDashboardViewModel)
      : null,
    isLoading: query.isLoading,
    errorMessage: query.error ? getApiErrorMessage(query.error, "We could not load the stylist dashboard yet.") : null,
  };
}

export function useStylistIntakesView(args?: GetStylistIntakesArgs) {
  const query = useGetStylistIntakesQuery({ limit: 50, ...args });
  const intakes = query.data?.intakes ?? [];
  return {
    intakes,
    rows: intakes.map(mapIntakeListRow),
    isLoading: query.isLoading,
    errorMessage: query.error ? getApiErrorMessage(query.error, "We could not load stylist intakes yet.") : null,
  };
}

export function useStylistIntakeDetailView(intakeId: string | null) {
  const query = useGetStylistIntakeQuery(intakeId ?? "", { skip: !intakeId });
  const intake = query.data?.intake ?? null;
  return {
    intake,
    view: intake ? mapIntakeDetailView(intake) : null,
    isLoading: query.isLoading,
    errorMessage: query.error ? getApiErrorMessage(query.error, "We could not load this intake yet.") : null,
  };
}

export function useStylistAppointmentsView(args?: GetStylistAppointmentsArgs) {
  const query = useGetStylistAppointmentsQuery({ limit: 50, ...args });
  const appointments = query.data?.appointments ?? [];
  return {
    appointments,
    rows: appointments.map(mapAppointmentListRow),
    isLoading: query.isLoading,
    errorMessage: query.error ? getApiErrorMessage(query.error, "We could not load stylist appointments yet.") : null,
  };
}

export function useStylistAppointmentDetailView(appointmentId: string | null) {
  const query = useGetStylistAppointmentQuery(appointmentId ?? "", { skip: !appointmentId });
  const appointment = query.data?.appointment ?? null;
  return {
    appointment,
    view: appointment ? mapAppointmentDetailView(appointment) : null,
    isLoading: query.isLoading,
    errorMessage: query.error ? getApiErrorMessage(query.error, "We could not load this appointment yet.") : null,
  };
}

export function useStylistClientsView(args?: GetStylistClientsArgs) {
  const query = useGetStylistClientsQuery({ limit: 50, ...args });
  const clients = query.data?.clients ?? [];
  return {
    clients,
    rows: clients.map(mapClientListRow),
    isLoading: query.isLoading,
    errorMessage: query.error ? getApiErrorMessage(query.error, "We could not load stylist clients yet.") : null,
  };
}

export function useStylistClientDetailView(clientId: string | null) {
  const query = useGetStylistClientQuery(clientId ?? "", { skip: !clientId });
  const client = query.data?.client ?? null;
  return {
    client,
    view: client ? mapClientDetailView(client) : null,
    isLoading: query.isLoading,
    errorMessage: query.error ? getApiErrorMessage(query.error, "We could not load this client yet.") : null,
  };
}
