import axios from "axios";

/**
 * RFC 7807 problem details: the body of every error response from the KNOX API.
 * Validation failures add `errors` (field -> messages); other failures add a machine-readable `code`.
 */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  code?: string;
  traceId?: string;
  errors?: Record<string, string[]>;
}

export function getProblemDetails(error: unknown): ProblemDetails | undefined {
  if (!axios.isAxiosError(error)) return undefined;
  const data: unknown = error.response?.data;
  return data && typeof data === "object" ? (data as ProblemDetails) : undefined;
}

/** HTTP status of a failed API call, if the server answered. */
export function getApiErrorStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}

/**
 * A human-readable message for a failed call: the server's explanation when there is one,
 * otherwise `fallback` (never axios's generic "Request failed with status code …").
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  const problem = getProblemDetails(error);
  if (problem?.detail) return problem.detail;

  const firstValidationMessage = problem?.errors ? Object.values(problem.errors).flat()[0] : undefined;
  if (firstValidationMessage) return firstValidationMessage;

  if (problem?.title) return problem.title;
  if (error instanceof Error && !axios.isAxiosError(error)) return error.message;
  return fallback;
}
