import { stylistApi } from "./base";
import type {
  CancelAppointmentRequestDto,
  MaintenancePlanResponseDto,
  MeResponseDto,
  NotificationPrefsDto,
  PortalAppointmentDetailResponseDto,
  PortalAppointmentsResponseDto,
  RescheduleAppointmentRequestDto,
  UpdateMeRequestDto,
  UpdateMeResponseDto,
  UpdateNotificationPrefsRequestDto,
  UpdateNotificationPrefsResponseDto,
} from "./types";

export interface GetMyAppointmentsArgs {
  status?: "upcoming" | "past";
  limit?: number;
  offset?: number;
}

export const portalApi = stylistApi.injectEndpoints({
  endpoints: (build) => ({
    getMe: build.query<MeResponseDto, void>({
      query: () => "me",
      providesTags: [{ type: "Me", id: "SESSION" }],
    }),
    updateMe: build.mutation<UpdateMeResponseDto["client"], UpdateMeRequestDto>({
      query: (body) => ({
        url: "me",
        method: "PATCH",
        body,
      }),
      transformResponse: (response: UpdateMeResponseDto) => response.client,
      invalidatesTags: [{ type: "Me", id: "SESSION" }],
    }),
    updateNotificationPrefs: build.mutation<NotificationPrefsDto, UpdateNotificationPrefsRequestDto>({
      query: (body) => ({
        url: "me/notification-prefs",
        method: "PATCH",
        body,
      }),
      transformResponse: (response: UpdateNotificationPrefsResponseDto) => response.notification_prefs,
      invalidatesTags: [{ type: "Me", id: "SESSION" }],
    }),
    getMyAppointments: build.query<PortalAppointmentsResponseDto, GetMyAppointmentsArgs | void>({
      query: (args) => ({
        url: "me/appointments",
        params: {
          ...(args?.status ? { status: args.status } : {}),
          ...(typeof args?.limit === "number" ? { limit: args.limit } : {}),
          ...(typeof args?.offset === "number" ? { offset: args.offset } : {}),
        },
      }),
      providesTags: (result) => {
        const baseTag = [{ type: "Appointments" as const, id: "LIST" }];
        if (!result) {
          return baseTag;
        }
        return [
          ...baseTag,
          ...result.appointments.map((appointment) => ({ type: "Appointments" as const, id: appointment.id })),
        ];
      },
    }),
    getMyAppointment: build.query<PortalAppointmentDetailResponseDto, string>({
      query: (appointmentId) => `me/appointments/${appointmentId}`,
      providesTags: (_result, _error, appointmentId) => [{ type: "Appointments", id: appointmentId }],
    }),
    rescheduleMyAppointment: build.mutation<UpdateMeResponseDto["client"] | null, { appointmentId: string; body: RescheduleAppointmentRequestDto }>({
      query: ({ appointmentId, body }) => ({
        url: `me/appointments/${appointmentId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, args) => [
        { type: "Appointments", id: "LIST" },
        { type: "Appointments", id: args.appointmentId },
      ],
    }),
    cancelMyAppointment: build.mutation<UpdateMeResponseDto["client"] | null, { appointmentId: string; body?: CancelAppointmentRequestDto }>({
      query: ({ appointmentId, body }) => ({
        url: `me/appointments/${appointmentId}/cancel`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, args) => [
        { type: "Appointments", id: "LIST" },
        { type: "Appointments", id: args.appointmentId },
      ],
    }),
    getMaintenancePlan: build.query<MaintenancePlanResponseDto, void>({
      query: () => "me/maintenance-plan",
      providesTags: [{ type: "Maintenance", id: "PLAN" }],
    }),
  }),
});

export const {
  useCancelMyAppointmentMutation,
  useGetMaintenancePlanQuery,
  useGetMeQuery,
  useGetMyAppointmentQuery,
  useGetMyAppointmentsQuery,
  useRescheduleMyAppointmentMutation,
  useUpdateMeMutation,
  useUpdateNotificationPrefsMutation,
} = portalApi;

