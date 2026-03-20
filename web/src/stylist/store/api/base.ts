import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import type { ApiEnvelope, ApiErrorEnvelope, ApiErrorPayload, ApiErrorResult } from "./types";

export const stylistApiTagTypes = [
  "Info",
  "Me",
  "Services",
  "Availability",
  "Appointments",
  "Maintenance",
  "Photos",
  "StylistDashboard",
  "StylistIntakes",
  "StylistAppointments",
  "StylistClients",
] as const;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: "/api",
  credentials: "include",
  prepareHeaders: (headers) => {
    headers.set("accept", "application/json");
    return headers;
  },
});

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function getApiErrorMessage(error: unknown, fallback = "The request failed."): string {
  if (isObject(error) && typeof error.message === "string" && error.message.trim() !== "") {
    return error.message;
  }

  if (isObject(error) && isObject(error.data) && typeof error.data.message === "string" && error.data.message.trim() !== "") {
    return error.data.message;
  }

  if (typeof error === "string" && error.trim() !== "") {
    return error;
  }

  return fallback;
}

function isApiErrorEnvelope(value: unknown): value is ApiErrorEnvelope {
  return isObject(value)
    && isObject(value.error)
    && typeof value.error.code === "string"
    && typeof value.error.message === "string";
}

function isApiEnvelope<T>(value: unknown): value is ApiEnvelope<T> {
  return isObject(value) && "data" in value;
}

function normalizeApiError(status: ApiErrorResult["status"], data: unknown): ApiErrorResult {
  if (isApiErrorEnvelope(data)) {
    return {
      status,
      code: data.error.code,
      message: data.error.message,
      data,
    };
  }

  if (typeof data === "string" && data.trim() !== "") {
    return {
      status,
      code: "request-failed",
      message: data,
      data,
    };
  }

  return {
    status,
    code: "request-failed",
    message: "The request failed.",
    data,
  };
}

function normalizeFetchError(error: FetchBaseQueryError): ApiErrorResult {
  if (typeof error.status === "string") {
    const detail = "error" in error ? error.error : undefined;
    return normalizeApiError(error.status, detail);
  }

  return normalizeApiError(error.status, error.data);
}

export const baseQueryWithEnvelope: BaseQueryFn<string | FetchArgs, unknown, ApiErrorResult> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if ("error" in result) {
    if (!result.error) {
      return {
        error: normalizeApiError("CUSTOM_ERROR", "The request failed without an error payload."),
      };
    }
    return { error: normalizeFetchError(result.error) };
  }

  const payload = result.data;
  if (isApiErrorEnvelope(payload)) {
    return { error: normalizeApiError("CUSTOM_ERROR", payload) };
  }

  if (isApiEnvelope(payload)) {
    return { data: payload.data };
  }

  return { data: payload };
};

export const stylistApi = createApi({
  reducerPath: "stylistApi",
  baseQuery: baseQueryWithEnvelope,
  tagTypes: [...stylistApiTagTypes],
  endpoints: () => ({}),
});

export type StylistApiTagType = typeof stylistApiTagTypes[number];
export type StylistApiError = ApiErrorResult;
export type StylistApiErrorPayload = ApiErrorPayload;
