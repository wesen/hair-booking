import { stylistApi } from "./base";
import type {
  StylistAppointmentDetailResponseDto,
  StylistAppointmentsResponseDto,
  StylistClientDetailResponseDto,
  StylistClientsResponseDto,
  StylistDashboardDto,
  StylistDashboardResponseDto,
  StylistIntakeDetailResponseDto,
  StylistIntakesResponseDto,
  StylistMeDto,
  UpdateStylistAppointmentRequestDto,
  UpdateStylistAppointmentResponseDto,
  UpdateStylistIntakeReviewRequestDto,
  UpdateStylistIntakeReviewResponseDto,
} from "./types";

export interface GetStylistIntakesArgs {
  status?: string;
  limit?: number;
  offset?: number;
}

export interface GetStylistAppointmentsArgs {
  status?: string;
  limit?: number;
  offset?: number;
}

export interface GetStylistClientsArgs {
  search?: string;
  limit?: number;
  offset?: number;
}

export const stylistOperationsApi = stylistApi.injectEndpoints({
  endpoints: (build) => ({
    getStylistMe: build.query<StylistMeDto, void>({
      query: () => "stylist/me",
    }),
    getStylistDashboard: build.query<StylistDashboardDto, void>({
      query: () => "stylist/dashboard",
      transformResponse: (response: StylistDashboardResponseDto) => response.dashboard,
      providesTags: [{ type: "StylistDashboard", id: "HOME" }],
    }),
    getStylistIntakes: build.query<StylistIntakesResponseDto, GetStylistIntakesArgs | void>({
      query: (args) => ({
        url: "stylist/intakes",
        params: {
          ...(args?.status ? { status: args.status } : {}),
          ...(typeof args?.limit === "number" ? { limit: args.limit } : {}),
          ...(typeof args?.offset === "number" ? { offset: args.offset } : {}),
        },
      }),
      providesTags: (result) => {
        const base = [{ type: "StylistIntakes" as const, id: "LIST" }];
        if (!result) {
          return base;
        }
        return [
          ...base,
          ...result.intakes.map((intake) => ({ type: "StylistIntakes" as const, id: intake.id })),
        ];
      },
    }),
    getStylistIntake: build.query<StylistIntakeDetailResponseDto, string>({
      query: (intakeId) => `stylist/intakes/${intakeId}`,
      providesTags: (_result, _error, intakeId) => [{ type: "StylistIntakes", id: intakeId }],
    }),
    updateStylistIntakeReview: build.mutation<UpdateStylistIntakeReviewResponseDto["review"], { intakeId: string; body: UpdateStylistIntakeReviewRequestDto }>({
      query: ({ intakeId, body }) => ({
        url: `stylist/intakes/${intakeId}/review`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: UpdateStylistIntakeReviewResponseDto) => response.review,
      invalidatesTags: (_result, _error, args) => [
        { type: "StylistIntakes", id: "LIST" },
        { type: "StylistIntakes", id: args.intakeId },
        { type: "StylistDashboard", id: "HOME" },
      ],
    }),
    getStylistAppointments: build.query<StylistAppointmentsResponseDto, GetStylistAppointmentsArgs | void>({
      query: (args) => ({
        url: "stylist/appointments",
        params: {
          ...(args?.status ? { status: args.status } : {}),
          ...(typeof args?.limit === "number" ? { limit: args.limit } : {}),
          ...(typeof args?.offset === "number" ? { offset: args.offset } : {}),
        },
      }),
      providesTags: (result) => {
        const base = [{ type: "StylistAppointments" as const, id: "LIST" }];
        if (!result) {
          return base;
        }
        return [
          ...base,
          ...result.appointments.map((appointment) => ({ type: "StylistAppointments" as const, id: appointment.id })),
        ];
      },
    }),
    getStylistAppointment: build.query<StylistAppointmentDetailResponseDto, string>({
      query: (appointmentId) => `stylist/appointments/${appointmentId}`,
      providesTags: (_result, _error, appointmentId) => [{ type: "StylistAppointments", id: appointmentId }],
    }),
    updateStylistAppointment: build.mutation<UpdateStylistAppointmentResponseDto["appointment"], { appointmentId: string; body: UpdateStylistAppointmentRequestDto }>({
      query: ({ appointmentId, body }) => ({
        url: `stylist/appointments/${appointmentId}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: UpdateStylistAppointmentResponseDto) => response.appointment,
      invalidatesTags: (result, _error, args) => [
        { type: "StylistAppointments", id: "LIST" },
        { type: "StylistAppointments", id: args.appointmentId },
        { type: "StylistDashboard", id: "HOME" },
        { type: "StylistClients", id: "LIST" },
        ...(result ? [{ type: "StylistClients" as const, id: result.client_id }] : []),
      ],
    }),
    getStylistClients: build.query<StylistClientsResponseDto, GetStylistClientsArgs | void>({
      query: (args) => ({
        url: "stylist/clients",
        params: {
          ...(args?.search ? { search: args.search } : {}),
          ...(typeof args?.limit === "number" ? { limit: args.limit } : {}),
          ...(typeof args?.offset === "number" ? { offset: args.offset } : {}),
        },
      }),
      providesTags: (result) => {
        const base = [{ type: "StylistClients" as const, id: "LIST" }];
        if (!result) {
          return base;
        }
        return [
          ...base,
          ...result.clients.map((client) => ({ type: "StylistClients" as const, id: client.id })),
        ];
      },
    }),
    getStylistClient: build.query<StylistClientDetailResponseDto, string>({
      query: (clientId) => `stylist/clients/${clientId}`,
      providesTags: (_result, _error, clientId) => [{ type: "StylistClients", id: clientId }],
    }),
  }),
});

export const {
  useGetStylistAppointmentQuery,
  useGetStylistAppointmentsQuery,
  useGetStylistClientQuery,
  useGetStylistClientsQuery,
  useGetStylistDashboardQuery,
  useGetStylistIntakeQuery,
  useGetStylistIntakesQuery,
  useGetStylistMeQuery,
  useUpdateStylistAppointmentMutation,
  useUpdateStylistIntakeReviewMutation,
} = stylistOperationsApi;
