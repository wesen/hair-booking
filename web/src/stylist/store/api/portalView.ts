import { getApiErrorMessage } from "./base";
import {
  mapClientToUserProfile,
  mapMaintenancePlanItemToMaintenanceItem,
  mapNotificationPrefsToViewModel,
  mapPortalAppointmentToAppointmentDetail,
} from "./mappers";
import { useGetMaintenancePlanQuery, useGetMeQuery, useGetMyAppointmentsQuery } from "./portalApi";

export function usePortalProfileView() {
  const meQuery = useGetMeQuery();

  return {
    client: meQuery.data?.client ?? null,
    user: meQuery.data?.client ? mapClientToUserProfile(meQuery.data.client) : null,
    notificationPrefs: meQuery.data?.notification_prefs
      ? mapNotificationPrefsToViewModel(meQuery.data.notification_prefs)
      : [],
    isLoading: meQuery.isLoading,
    errorMessage: meQuery.error ? getApiErrorMessage(meQuery.error, "We could not load your profile yet.") : null,
  };
}

export function usePortalHomeView() {
  const profileQuery = useGetMeQuery();
  const appointmentsQuery = useGetMyAppointmentsQuery({ status: "upcoming", limit: 20 });
  const maintenanceQuery = useGetMaintenancePlanQuery();

  return {
    user: profileQuery.data?.client ? mapClientToUserProfile(profileQuery.data.client) : null,
    nextAppointment: appointmentsQuery.data?.appointments?.[0]
      ? mapPortalAppointmentToAppointmentDetail(appointmentsQuery.data.appointments[0])
      : null,
    maintenance: maintenanceQuery.data?.items.map(mapMaintenancePlanItemToMaintenanceItem) ?? [],
    isLoading: profileQuery.isLoading || appointmentsQuery.isLoading || maintenanceQuery.isLoading,
    errorMessage: profileQuery.error || appointmentsQuery.error || maintenanceQuery.error
      ? getApiErrorMessage(profileQuery.error ?? appointmentsQuery.error ?? maintenanceQuery.error, "We could not load your portal summary yet.")
      : null,
  };
}

export function usePortalAppointmentsView(status: "upcoming" | "past") {
  const appointmentsQuery = useGetMyAppointmentsQuery({ status, limit: 20 });

  return {
    appointments: appointmentsQuery.data?.appointments.map(mapPortalAppointmentToAppointmentDetail) ?? [],
    total: appointmentsQuery.data?.total ?? 0,
    isLoading: appointmentsQuery.isLoading,
    errorMessage: appointmentsQuery.error ? getApiErrorMessage(appointmentsQuery.error, "We could not load your appointments yet.") : null,
  };
}
