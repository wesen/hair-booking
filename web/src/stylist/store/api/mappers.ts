import type {
  AppointmentDetail,
  AppointmentStatus,
  ConsultationData,
  ConsultationServiceType,
  MaintenanceItem,
  NotificationPref,
  PhotoEntry,
  UserProfile,
} from "../../types";
import type {
  AppointmentPhotoDto,
  ClientDto,
  IntakeCreateRequestDto,
  MaintenancePlanItemDto,
  NotificationPrefsDto,
  PortalAppointmentDto,
  ServiceCatalogItemDto,
} from "./types";

export interface CatalogServiceViewModel {
  id: string;
  name: string;
  category: string;
  durationLabel: string;
  priceLabel: string;
  isActive: boolean;
}

function formatMonthYear(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function formatPriceLabel(low?: number | null, high?: number | null): string {
  if (typeof low === "number" && typeof high === "number") {
    if (low === high) {
      return `$${low}`;
    }
    return `$${low}-$${high}`;
  }
  if (typeof low === "number") {
    return `From $${low}`;
  }
  if (typeof high === "number") {
    return `Up to $${high}`;
  }
  return "Custom quote";
}

function formatDurationLabel(durationMin: number): string {
  if (durationMin <= 0) {
    return "";
  }
  if (durationMin < 60) {
    return `${durationMin} min`;
  }

  const hours = durationMin / 60;
  if (Number.isInteger(hours)) {
    return `${hours} hr${hours === 1 ? "" : "s"}`;
  }

  return `${hours.toFixed(1)} hrs`;
}

function normalizePortalAppointmentStatus(status: string): AppointmentStatus {
  switch (status) {
    case "confirmed":
      return "confirmed";
    case "pending":
      return "pending";
    case "completed":
    case "complete":
      return "complete";
    case "cancelled":
    case "no_show":
      return "cancelled";
    default:
      return "pending";
  }
}

function normalizeMaintenanceStatus(status: string): MaintenanceItem["status"] {
  switch (status) {
    case "done":
    case "next":
    case "upcoming":
      return status;
    case "overdue":
      return "upcoming";
    default:
      return "upcoming";
  }
}

function getClientInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    return "CL";
  }
  return trimmed
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

function stableNumericId(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function mapCatalogServiceToViewModel(item: ServiceCatalogItemDto): CatalogServiceViewModel {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    durationLabel: formatDurationLabel(item.duration_min),
    priceLabel: formatPriceLabel(item.price_low, item.price_high),
    isActive: item.is_active,
  };
}

export function mapConsultationDataToIntakeRequest(data: ConsultationData): IntakeCreateRequestDto {
  return {
    service_type: data.serviceType ?? "extensions",
    hair_length: data.hairLength || undefined,
    hair_density: data.hairDensity || undefined,
    hair_texture: data.hairTexture || undefined,
    prev_extensions: data.prevExtensions || undefined,
    color_service: data.colorService || undefined,
    natural_level: data.naturalLevel || undefined,
    current_color: data.currentColor || undefined,
    chemical_history: data.chemicalHistory,
    last_chemical: data.lastChemical || undefined,
    desired_length: data.desiredLength,
    ext_type: data.extType || undefined,
    budget: data.budget || undefined,
    maintenance: data.maintenance || undefined,
    deadline: data.deadline || undefined,
    dream_result: data.dreamResult || undefined,
  };
}

export function findConsultService(
  services: ServiceCatalogItemDto[] | undefined,
  serviceType: ConsultationServiceType | null,
): ServiceCatalogItemDto | null {
  if (!services || services.length === 0) {
    return null;
  }

  const prefersColor = serviceType === "color";
  const preferredName = prefersColor ? "Color Consultation" : "Extensions Consultation";

  return (
    services.find((service) => service.name === preferredName)
    ?? services.find((service) => service.category === "consult" && service.name.toLowerCase().includes(prefersColor ? "color" : "extension"))
    ?? services.find((service) => service.category === "consult")
    ?? null
  );
}

export function mapPortalAppointmentToAppointmentDetail(appointment: PortalAppointmentDto): AppointmentDetail {
  return {
    id: stableNumericId(appointment.id),
    remoteId: appointment.id,
    serviceId: appointment.service_id,
    scheduledDate: appointment.date,
    scheduledTime: appointment.start_time,
    date: appointment.date_label,
    service: appointment.service_name,
    time: appointment.start_time,
    duration: appointment.duration_label,
    price: appointment.price_high || appointment.price_low,
    status: normalizePortalAppointmentStatus(appointment.status),
  };
}

export function mapMaintenancePlanItemToMaintenanceItem(item: MaintenancePlanItemDto): MaintenanceItem {
  return {
    date: item.due_date_label,
    service: item.service_name,
    status: normalizeMaintenanceStatus(item.status),
  };
}

export function mapNotificationPrefsToViewModel(
  prefs: NotificationPrefsDto,
  includeMarketing = false,
): NotificationPref[] {
  const items: NotificationPref[] = [
    { key: "remind48hr", label: "Text reminders (48hr)", on: prefs.remind_48hr },
    { key: "remind2hr", label: "Text reminders (2hr)", on: prefs.remind_2hr },
    { key: "maintAlerts", label: "Maintenance alerts", on: prefs.maint_alerts },
  ];

  if (includeMarketing) {
    items.push({ key: "marketing", label: "Marketing / promos", on: false });
  }

  return items;
}

export function mapClientToUserProfile(client: ClientDto, rewardsPoints = 0): UserProfile {
  const since = formatMonthYear(client.created_at);
  return {
    name: client.name,
    email: client.email ?? "",
    phone: client.phone ?? "",
    since,
    initials: getClientInitials(client.name),
    tier: "Bronze",
    points: rewardsPoints,
    pointsToNext: 100,
    nextTier: "Silver",
    referralCode: "",
    referralCount: 0,
    serviceDescription: client.service_summary || client.scalp_notes || "Profile details not set yet.",
    perks: [],
  };
}

export function mapAppointmentPhotosToPhotoEntry(
  appointment: PortalAppointmentDto,
  photos: AppointmentPhotoDto[],
): PhotoEntry {
  const beforePhoto = photos.find((photo) => photo.slot === "before");
  const afterPhoto = photos.find((photo) => photo.slot === "after");
  const fallbackPhoto = photos[0];

  return {
    id: stableNumericId(appointment.id),
    date: appointment.date_label,
    service: appointment.service_name,
    caption: fallbackPhoto?.caption ?? "",
    beforeUrl: beforePhoto?.url ?? null,
    afterUrl: afterPhoto?.url ?? null,
  };
}
