export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

/** Thin fetch wrapper: parses JSON, throws ApiError with the server's
 * message on non-2xx so TanStack Query's error state carries something
 * user-facing instead of a generic "Failed to fetch". */
export async function fetchJson<T>(
  input: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(input, init);
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (body &&
      typeof body === "object" &&
      "error" in body &&
      typeof body.error === "string"
        ? body.error
        : undefined) ?? "Something went wrong";
    throw new ApiError(message, response.status);
  }

  return body as T;
}
