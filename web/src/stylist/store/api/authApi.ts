import { stylistApi } from "./base";
import type { InfoDto } from "./types";

export const authApi = stylistApi.injectEndpoints({
  endpoints: (build) => ({
    getInfo: build.query<InfoDto, void>({
      query: () => "info",
      providesTags: [{ type: "Info", id: "APP" }],
    }),
  }),
});

export const { useGetInfoQuery } = authApi;

