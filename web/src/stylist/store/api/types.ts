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

