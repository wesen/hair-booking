import { stylistApi } from "./base";
import { useGetMeQuery } from "./portalApi";
import type { InfoDto, MeResponseDto } from "./types";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getErrorStatus(error: unknown): string | number | undefined {
  if (isObject(error) && "status" in error) {
    const status = error.status;
    if (typeof status === "string" || typeof status === "number") {
      return status;
    }
  }
  return undefined;
}

function getErrorMessage(error: unknown): string {
  if (isObject(error) && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return "The request failed.";
}

export interface SessionBootstrapResult {
  authMode: string;
  client: MeResponseDto["client"] | null;
  notificationPrefs: MeResponseDto["notification_prefs"] | null;
  isAuthenticated: boolean;
  isUnauthenticated: boolean;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string | null;
  loginPath: string;
  logoutPath: string;
}

export const authApi = stylistApi.injectEndpoints({
  endpoints: (build) => ({
    getInfo: build.query<InfoDto, void>({
      query: () => "info",
      providesTags: [{ type: "Info", id: "APP" }],
    }),
  }),
});

export const { useGetInfoQuery } = authApi;

export function useSessionBootstrap(): SessionBootstrapResult {
  const infoQuery = useGetInfoQuery();
  const meQuery = useGetMeQuery();

  const isUnauthenticated = getErrorStatus(meQuery.error) === 401;
  const sessionError = infoQuery.error ?? (isUnauthenticated ? null : meQuery.error);
  const client = meQuery.data?.client ?? null;
  const notificationPrefs = meQuery.data?.notification_prefs ?? null;

  return {
    authMode: infoQuery.data?.authMode ?? "unknown",
    client,
    notificationPrefs,
    isAuthenticated: !!client,
    isUnauthenticated,
    isLoading: infoQuery.isLoading || meQuery.isLoading,
    hasError: !!sessionError,
    errorMessage: sessionError ? getErrorMessage(sessionError) : null,
    loginPath: infoQuery.data?.loginPath ?? "/auth/login",
    logoutPath: infoQuery.data?.logoutPath ?? "/auth/logout",
  };
}
