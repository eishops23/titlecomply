import { NextResponse } from "next/server";
import { ZodError } from "zod";

export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}

/**
 * Create a consistent error response.
 */
export function apiError(
  message: string,
  status: number = 500,
  code?: string,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return NextResponse.json({ error: message, code, details }, { status });
}

/**
 * Handle caught errors consistently.
 * Use in catch blocks across API routes.
 */
export function handleApiError(
  error: unknown,
  context: string
): NextResponse<ApiErrorResponse> {
  if (error instanceof ZodError) {
    return apiError("Validation failed", 400, "VALIDATION_ERROR", error.issues);
  }

  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`[${context}] Error:`, message);
  return apiError("Internal server error", 500, "INTERNAL_ERROR");
}
