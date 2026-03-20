import { stylistApi } from "./base";
import type { ServiceCatalogItemDto, ServicesResponseDto } from "./types";

export interface GetServicesArgs {
  category?: string;
}

export const servicesApi = stylistApi.injectEndpoints({
  endpoints: (build) => ({
    getServices: build.query<ServiceCatalogItemDto[], GetServicesArgs | void>({
      query: (args) => ({
        url: "services",
        params: args?.category ? { category: args.category } : undefined,
      }),
      transformResponse: (response: ServicesResponseDto) => response.services,
      providesTags: (result) => {
        const baseTag = [{ type: "Services" as const, id: "LIST" }];
        if (!result) {
          return baseTag;
        }
        return [
          ...baseTag,
          ...result.map((service) => ({ type: "Services" as const, id: service.id })),
        ];
      },
    }),
  }),
});

export const { useGetServicesQuery } = servicesApi;
