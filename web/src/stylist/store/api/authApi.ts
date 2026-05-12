import { stylistApi } from "./base";
import { useGetMeQuery } from "./portalApi";
import type { AuthSessionDto, ClientDto, InfoDto, MeResponseDto } from "./types";

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

function isAuthSessionDto(value: unknown): value is AuthSessionDto {
  return isObject(value)
    && "authenticated" in value
    && typeof value.authenticated === "boolean"
    && "authMode" in value
    && typeof value.authMode === "string"
    && "subject" in value
    && typeof value.subject === "string";
}

function buildClientFromAuthSession(session: AuthSessionDto): ClientDto {
  return {
    id: session.subject,
    auth_subject: session.subject,
    auth_issuer: session.issuer,
    name: session.displayName || session.preferredUsername || session.email || "Client",
    email: session.email,
    phone: undefined,
    scalp_notes: undefined,
    service_summary: undefined,
    created_at: "",
    updated_at: "",
  };
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
  const authSession = isAuthSessionDto(meQuery.data) ? meQuery.data : null;
  const client = meQuery.data?.client ?? (authSession?.authenticated ? buildClientFromAuthSession(authSession) : null);
  const notificationPrefs = meQuery.data?.notification_prefs ?? null;

  return {
    authMode: infoQuery.data?.authMode ?? authSession?.authMode ?? "unknown",
    client,
    notificationPrefs,
    isAuthenticated: !!client || !!authSession?.authenticated,
    isUnauthenticated,
    isLoading: infoQuery.isLoading || meQuery.isLoading,
    hasError: !!sessionError,
    errorMessage: sessionError ? getErrorMessage(sessionError) : null,
    loginPath: infoQuery.data?.loginPath ?? "/auth/login",
    logoutPath: infoQuery.data?.logoutPath ?? "/auth/logout",
  };
}
