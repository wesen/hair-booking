export interface ApiEnvelope<T> {
  data?: T;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
}

export interface ApiErrorEnvelope {
  error: ApiErrorPayload;
}

export interface ApiErrorResult {
  status: number | "FETCH_ERROR" | "PARSING_ERROR" | "TIMEOUT_ERROR" | "CUSTOM_ERROR";
  code: string;
  message: string;
  data?: unknown;
}

export interface InfoDto {
  service: string;
  version: string;
  startedAt: string;
  authMode: string;
  issuerUrl?: string;
  clientId?: string;
  loginPath?: string;
  logoutPath?: string;
  callbackPath?: string;
  databaseConfigured: boolean;
}

export type ServiceCategory = "extensions" | "color" | "treatment" | "consult";

export interface ServiceCatalogItemDto {
  id: string;
  name: string;
  category: ServiceCategory | string;
  duration_min: number;
  price_low?: number | null;
  price_high?: number | null;
  is_active: boolean;
  sort_order: number;
}

export interface ServicesResponseDto {
  services: ServiceCatalogItemDto[];
}

export interface IntakeCreateRequestDto {
  service_type: "extensions" | "color" | "both";
  hair_length?: string;
  hair_density?: string;
  hair_texture?: string;
  prev_extensions?: string;
  color_service?: string;
  natural_level?: string;
  current_color?: string;
  chemical_history?: string[];
  last_chemical?: string;
  desired_length?: number;
  ext_type?: string;
  budget?: string;
  maintenance?: string;
  deadline?: string;
  dream_result?: string;
}

export interface IntakeCreateResponseDto {
  id: string;
  estimate_low: number;
  estimate_high: number;
}

export interface IntakePhotoResponseDto {
  id: string;
  url: string;
}

export interface AvailabilityResponseDto {
  availability: Record<string, string[]>;
}

export interface CreateAppointmentRequestDto {
  intake_id?: string;
  service_id: string;
  date: string;
  start_time: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
}

export interface AppointmentDto {
  id: string;
  client_id: string;
  service_id: string;
  intake_id?: string | null;
  date: string;
  start_time: string;
  duration_min_snapshot: number;
  status: string;
  cancelled_at?: string | null;
  cancel_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAppointmentResponseDto {
  appointment: AppointmentDto;
}

export interface ClientDto {
  id: string;
  auth_subject?: string;
  auth_issuer?: string;
  name: string;
  email?: string;
  phone?: string;
  scalp_notes?: string;
  service_summary?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationPrefsDto {
  client_id: string;
  remind_48hr: boolean;
  remind_2hr: boolean;
  maint_alerts: boolean;
}

export interface MeResponseDto {
  client: ClientDto;
  notification_prefs: NotificationPrefsDto;
}

export interface UpdateMeRequestDto {
  name?: string;
  email?: string;
  phone?: string;
  scalp_notes?: string;
}

export interface UpdateMeResponseDto {
  client: ClientDto;
}

export interface UpdateNotificationPrefsRequestDto {
  remind_48hr?: boolean;
  remind_2hr?: boolean;
  maint_alerts?: boolean;
}

export interface UpdateNotificationPrefsResponseDto {
  notification_prefs: NotificationPrefsDto;
}

export interface PortalAppointmentDto extends AppointmentDto {
  service_name: string;
  service_category: string;
  price_low: number;
  price_high: number;
  date_label: string;
  duration_label: string;
}

export interface PortalAppointmentsResponseDto {
  appointments: PortalAppointmentDto[];
  total: number;
}

export interface ServiceInfoDto {
  id: string;
  name: string;
  category: string;
  duration_min: number;
  price_low: number;
  price_high: number;
  is_active: boolean;
}

export interface AppointmentPhotoDto {
  id: string;
  slot: string;
  storage_key: string;
  url: string;
  caption?: string;
}

export interface PortalAppointmentDetailResponseDto {
  appointment: PortalAppointmentDto;
  service: ServiceInfoDto;
  photos: AppointmentPhotoDto[];
}

export interface RescheduleAppointmentRequestDto {
  date: string;
  start_time: string;
}

export interface CancelAppointmentRequestDto {
  reason?: string;
}

export interface MaintenancePlanDto {
  id: string;
  client_id: string;
}

export interface MaintenancePlanItemDto {
  id: string;
  plan_id: string;
  service_id: string;
  service_name: string;
  due_date: string;
  due_date_label: string;
  status: string;
  appointment_id?: string | null;
  sort_order: number;
}

export interface MaintenancePlanResponseDto {
  plan: MaintenancePlanDto | null;
  items: MaintenancePlanItemDto[];
}

export interface StylistMeDto {
  subject: string;
  email?: string;
  displayName: string;
  authMode: string;
}

export interface DashboardIntakeStatsDto {
  new_count: number;
  in_review_count: number;
  needs_client_reply_count: number;
  approved_to_book_count: number;
}

export interface DashboardAppointmentDto {
  appointment_id: string;
  client_id: string;
  client_name: string;
  service_id: string;
  service_name: string;
  date: string;
  start_time: string;
  status: string;
}

export interface StylistDashboardDto {
  intakes: DashboardIntakeStatsDto;
  today_appointments: number;
  today_schedule: DashboardAppointmentDto[];
  upcoming_appointments: DashboardAppointmentDto[];
}

export interface StylistDashboardResponseDto {
  dashboard: StylistDashboardDto;
}

export interface IntakeReviewDto {
  id: string;
  intake_id: string;
  status: string;
  priority: string;
  summary?: string;
  internal_notes?: string;
  quoted_price_low?: number | null;
  quoted_price_high?: number | null;
  reviewed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface StylistIntakeListItemDto {
  id: string;
  service_type: string;
  dream_result?: string;
  estimate_low: number;
  estimate_high: number;
  photo_count: number;
  submitted_at: string;
  client?: ClientDto | null;
  review: IntakeReviewDto;
  last_action_at: string;
}

export interface StylistIntakesResponseDto {
  intakes: StylistIntakeListItemDto[];
}

export interface IntakePhotoDto {
  id: string;
  intake_id: string;
  slot: string;
  storage_key: string;
  url: string;
}

export interface IntakeSubmissionDto {
  id: string;
  client_id?: string | null;
  service_type: string;
  hair_length?: string;
  hair_density?: string;
  hair_texture?: string;
  prev_extensions?: string;
  color_service?: string;
  natural_level?: string;
  current_color?: string;
  chemical_history?: string[];
  last_chemical?: string;
  desired_length?: number;
  ext_type?: string;
  budget?: string;
  maintenance?: string;
  deadline?: string;
  dream_result?: string;
  estimate_low: number;
  estimate_high: number;
  created_at: string;
}

export interface StylistIntakeDetailDto {
  submission: IntakeSubmissionDto;
  client?: ClientDto | null;
  photos: IntakePhotoDto[];
  review: IntakeReviewDto;
}

export interface StylistIntakeDetailResponseDto {
  intake: StylistIntakeDetailDto;
}

export interface UpdateStylistIntakeReviewRequestDto {
  status?: string;
  priority?: string;
  summary?: string;
  internal_notes?: string;
  quoted_price_low?: number;
  quoted_price_high?: number;
}

export interface UpdateStylistIntakeReviewResponseDto {
  review: IntakeReviewDto;
}

export interface StylistAppointmentDto {
  id: string;
  client_id: string;
  client_name: string;
  service_id: string;
  service_name: string;
  intake_id?: string | null;
  date: string;
  start_time: string;
  status: string;
  prep_notes?: string;
  stylist_notes?: string;
  cancelled_at?: string | null;
  cancel_reason?: string;
}

export interface StylistAppointmentsResponseDto {
  appointments: StylistAppointmentDto[];
}

export interface StylistAppointmentDetailDto {
  appointment: StylistAppointmentDto;
  client?: ClientDto | null;
  intake?: IntakeSubmissionDto | null;
  photos: AppointmentPhotoDto[];
}

export interface StylistAppointmentDetailResponseDto {
  appointment: StylistAppointmentDetailDto;
}

export interface UpdateStylistAppointmentRequestDto {
  status?: string;
  prep_notes?: string;
  stylist_notes?: string;
}

export interface UpdateStylistAppointmentResponseDto {
  appointment: StylistAppointmentDto;
}

export interface UploadStylistAppointmentPhotoResponseDto {
  photo: AppointmentPhotoDto;
}

export interface StylistClientListItemDto {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  scalp_notes?: string;
  service_summary?: string;
  appointment_count: number;
  intake_count: number;
  last_appointment_date?: string;
  upcoming_appointment_id?: string | null;
  upcoming_appointment_date?: string;
  upcoming_appointment_time?: string;
  last_intake_id?: string | null;
  last_review_status?: string;
  created_at: string;
  updated_at: string;
}

export interface StylistClientsResponseDto {
  clients: StylistClientListItemDto[];
}

export interface StylistClientAppointmentSummaryDto {
  id: string;
  service_id: string;
  service_name: string;
  intake_id?: string | null;
  date: string;
  start_time: string;
  status: string;
}

export interface StylistClientIntakeSummaryDto {
  id: string;
  service_type: string;
  dream_result?: string;
  estimate_low: number;
  estimate_high: number;
  submitted_at: string;
  photo_count: number;
  review: IntakeReviewDto;
}

export interface StylistClientDetailDto {
  client: ClientDto;
  appointment_count: number;
  intake_count: number;
  upcoming_appointment?: StylistClientAppointmentSummaryDto | null;
  recent_appointments: StylistClientAppointmentSummaryDto[];
  recent_intakes: StylistClientIntakeSummaryDto[];
  maintenance_plan?: MaintenancePlanDto | null;
  maintenance_items: MaintenancePlanItemDto[];
}

export interface StylistClientDetailResponseDto {
  client: StylistClientDetailDto;
}
