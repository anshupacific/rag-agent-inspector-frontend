/** Calls to the Agent Inspector backend. */

import { API_BASE_URL } from "../config";
import type { AgentResult, Evaluation, Step } from "../types";
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

/** Send a request and turn any failure into an ApiError with a readable message. */
async function request(url: string, init: RequestInit | undefined, fallbackMessage: string): Promise<Response> {
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

function postJson(url: string, body: unknown, fallbackMessage: string): Promise<Response> {
  return request(
    url,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
    fallbackMessage,
  );
}

const ASK_FAILED = "The agent could not answer. Ask again in a moment.";
const EVALUATION_FAILED = "This answer could not be evaluated.";

export async function checkHealth(baseUrl = API_BASE_URL): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

// ---------- Answers ----------

/** One question in, the full answer out. No live updates. */
export async function ask(question: string, baseUrl = API_BASE_URL): Promise<AgentResult> {
  const response = await postJson(`${baseUrl}/api/ask`, { question }, ASK_FAILED);
  return (await response.json()) as AgentResult;
}

/** Same answer, with steps and text reported as they happen. */
export async function askStream(
  question: string,
  handlers: StreamHandlers,
  baseUrl = API_BASE_URL,
): Promise<AgentResult> {
  const response = await postJson(`${baseUrl}/api/ask/stream`, { question }, ASK_FAILED);
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

// ---------- Per-answer evaluation ----------

/** Start scoring an answer. Returns the instant checks; Foundry's scores follow later. */
export async function startEvaluation(responseId: string, baseUrl = API_BASE_URL): Promise<Evaluation> {
  const response = await postJson(`${baseUrl}/api/evaluations`, { response_id: responseId }, EVALUATION_FAILED);
  return (await response.json()) as Evaluation;
}

/** Current state of an evaluation; `status` becomes "completed" when the scores are in. */
export async function getEvaluation(responseId: string, baseUrl = API_BASE_URL): Promise<Evaluation> {
  const url = `${baseUrl}/api/evaluations/${encodeURIComponent(responseId)}`;
  const response = await request(url, undefined, EVALUATION_FAILED);
  return (await response.json()) as Evaluation;
}