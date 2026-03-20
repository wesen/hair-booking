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

export function useStylistDashboardView() {
  const query = useGetStylistDashboardQuery();
  return {
    dashboard: query.data ?? null,
    isLoading: query.isLoading,
    errorMessage: query.error ? getApiErrorMessage(query.error, "We could not load the stylist dashboard yet.") : null,
  };
}

export function useStylistIntakesView(args?: GetStylistIntakesArgs) {
  const query = useGetStylistIntakesQuery({ limit: 50, ...args });
  return {
    intakes: query.data?.intakes ?? [],
    isLoading: query.isLoading,
    errorMessage: query.error ? getApiErrorMessage(query.error, "We could not load stylist intakes yet.") : null,
  };
}

export function useStylistIntakeDetailView(intakeId: string | null) {
  const query = useGetStylistIntakeQuery(intakeId ?? "", { skip: !intakeId });
  return {
    intake: query.data?.intake ?? null,
    isLoading: query.isLoading,
    errorMessage: query.error ? getApiErrorMessage(query.error, "We could not load this intake yet.") : null,
  };
}

export function useStylistAppointmentsView(args?: GetStylistAppointmentsArgs) {
  const query = useGetStylistAppointmentsQuery({ limit: 50, ...args });
  return {
    appointments: query.data?.appointments ?? [],
    isLoading: query.isLoading,
    errorMessage: query.error ? getApiErrorMessage(query.error, "We could not load stylist appointments yet.") : null,
  };
}

export function useStylistAppointmentDetailView(appointmentId: string | null) {
  const query = useGetStylistAppointmentQuery(appointmentId ?? "", { skip: !appointmentId });
  return {
    appointment: query.data?.appointment ?? null,
    isLoading: query.isLoading,
    errorMessage: query.error ? getApiErrorMessage(query.error, "We could not load this appointment yet.") : null,
  };
}

export function useStylistClientsView(args?: GetStylistClientsArgs) {
  const query = useGetStylistClientsQuery({ limit: 50, ...args });
  return {
    clients: query.data?.clients ?? [],
    isLoading: query.isLoading,
    errorMessage: query.error ? getApiErrorMessage(query.error, "We could not load stylist clients yet.") : null,
  };
}

export function useStylistClientDetailView(clientId: string | null) {
  const query = useGetStylistClientQuery(clientId ?? "", { skip: !clientId });
  return {
    client: query.data?.client ?? null,
    isLoading: query.isLoading,
    errorMessage: query.error ? getApiErrorMessage(query.error, "We could not load this client yet.") : null,
  };
}
