/** One place for talking to the backend over HTTP and turning failures into readable errors. */

/** An error whose message is safe to show to the visitor. */
export class ApiError extends Error {
  /** True when asking again would fail the same way (bad input, gone, rate limit). */
  readonly final: boolean;

  constructor(message: string, final = false) {
    super(message);
    this.name = "ApiError";
    this.final = final;
  }
}

const UNREACHABLE = "The backend did not respond. Check your connection and ask again.";

/** Send a request and turn any failure into an ApiError with a readable message. */
export async function request(url: string, init: RequestInit | undefined, fallbackMessage: string): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch {
    throw new ApiError(UNREACHABLE);
  }
  if (!response.ok) {
    let detail = fallbackMessage;
    try {
      const body = await response.json();
      if (typeof body?.detail === "string") detail = body.detail;
    } catch {
      /* keep the fallback message */
    }
    // 400 = bad input, 404 = gone, 429 = rate limit: retrying will not help.
    throw new ApiError(detail, [400, 404, 429].includes(response.status));
  }
  return response;
}

export function postJson(url: string, body: unknown, fallbackMessage: string): Promise<Response> {
  return request(
    url,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
    fallbackMessage,
  );
}
