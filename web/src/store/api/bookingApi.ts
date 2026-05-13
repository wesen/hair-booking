import { stylistApi } from "./base";
import type {
  AvailabilityResponseDto,
  CreateAppointmentRequestDto,
  CreateAppointmentResponseDto,
  IntakeCreateRequestDto,
  IntakeCreateResponseDto,
  IntakePhotoResponseDto,
} from "./types";

export interface UploadIntakePhotoArgs {
  intakeId: string;
  slot: string;
  file: File;
}

export interface GetAvailabilityArgs {
  month: string;
  serviceId?: string;
}

export const bookingApi = stylistApi.injectEndpoints({
  endpoints: (build) => ({
    createIntake: build.mutation<IntakeCreateResponseDto, IntakeCreateRequestDto>({
      query: (body) => ({
        url: "intake",
        method: "POST",
        body,
      }),
    }),
    uploadIntakePhoto: build.mutation<IntakePhotoResponseDto, UploadIntakePhotoArgs>({
      query: ({ intakeId, slot, file }) => {
        const body = new FormData();
        body.set("slot", slot);
        body.set("file", file);
        return {
          url: `intake/${intakeId}/photos`,
          method: "POST",
          body,
        };
      },
    }),
    getAvailability: build.query<Record<string, string[]>, GetAvailabilityArgs>({
      query: ({ month, serviceId }) => ({
        url: "availability",
        params: {
          month,
          ...(serviceId ? { service_id: serviceId } : {}),
        },
      }),
      transformResponse: (response: AvailabilityResponseDto) => response.availability,
      providesTags: (_result, _error, args) => [{ type: "Availability", id: `${args.month}:${args.serviceId ?? "all"}` }],
    }),
    createAppointment: build.mutation<CreateAppointmentResponseDto["appointment"], CreateAppointmentRequestDto>({
      query: (body) => ({
        url: "appointments",
        method: "POST",
        body,
      }),
      transformResponse: (response: CreateAppointmentResponseDto) => response.appointment,
      invalidatesTags: (_result, _error, args) => [
        { type: "Availability", id: `${args.date.slice(0, 7)}:${args.service_id}` },
        { type: "Appointments", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useCreateAppointmentMutation,
  useCreateIntakeMutation,
  useGetAvailabilityQuery,
  useUploadIntakePhotoMutation,
} = bookingApi;

