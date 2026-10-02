/** Calls to the Agent Inspector backend. */

import { API_BASE_URL } from "../config";
import type { AgentResult, Step } from "../types";
import { readSse } from "./sse";

/** An error whose message is safe to show to the visitor. */
export class ApiError extends Error {
  /** True when asking again would fail the same way (bad input, rate limit). */
  readonly final: boolean;

  constructor(message: string, final = false) {
    super(message);
    this.name = "ApiError";
    this.final = final;
  }
}

export interface StreamHandlers {
  onStep: (step: Step) => void;
  onDelta: (text: string) => void;
}

const UNREACHABLE = "The backend did not respond. Check your connection and ask again.";

async function post(path: string, question: string, baseUrl: string): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
  } catch {
    throw new ApiError(UNREACHABLE);
  }
  if (!response.ok) {
    let detail = "The agent could not answer. Ask again in a moment.";
    try {
      const body = await response.json();
      if (typeof body?.detail === "string") detail = body.detail;
    } catch {
      /* keep the default message */
    }
    // 400 = bad question, 429 = rate limit: retrying will not help.
    throw new ApiError(detail, response.status === 400 || response.status === 429);
  }
  return response;
}

export async function checkHealth(baseUrl = API_BASE_URL): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

/** One question in, the full answer out. No live updates. */
export async function ask(question: string, baseUrl = API_BASE_URL): Promise<AgentResult> {
  const response = await post("/api/ask", question, baseUrl);
  return (await response.json()) as AgentResult;
}

/** Same answer, with steps and text reported as they happen. */
export async function askStream(
  question: string,
  handlers: StreamHandlers,
  baseUrl = API_BASE_URL,
): Promise<AgentResult> {
  const response = await post("/api/ask/stream", question, baseUrl);
  if (!response.body) throw new ApiError("The browser could not read the live answer.");

  for await (const message of readSse(response.body)) {
    const data = JSON.parse(message.data);
    if (message.event === "step") handlers.onStep(data as Step);
    else if (message.event === "delta") handlers.onDelta(String(data.text ?? ""));
    else if (message.event === "result") return data as AgentResult;
    else if (message.event === "error") throw new ApiError(String(data.message ?? "The agent call failed."));
  }
  throw new ApiError("The answer stopped before it finished.");
}

/**
 * Try the live stream first. If it fails for a reason a retry might fix,
 * ask once more through the plain endpoint so the visitor still gets an answer.
 */
export async function askWithFallback(
  question: string,
  handlers: StreamHandlers,
  baseUrl = API_BASE_URL,
): Promise<AgentResult> {
  try {
    return await askStream(question, handlers, baseUrl);
  } catch (error) {
    if (error instanceof ApiError && error.final) throw error;
    return ask(question, baseUrl);
  }
}
