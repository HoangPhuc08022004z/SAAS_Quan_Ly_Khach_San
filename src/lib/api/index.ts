import { IApiService } from "./contracts";
import { mockService } from "@/mocks/mock-service";
import { DATA_SOURCE } from "@/config/constants";

// When NEXT_PUBLIC_DATA_SOURCE=http in future, swap here
export const api: IApiService = DATA_SOURCE === "http" ? mockService : mockService;

// SaaS PMS OpenAPI client & helper functions directly mapped to openapi.yaml
export { saasApi } from "./saas-api";
export * from "./saas-api";
export * from "./types/openapi.interface";
