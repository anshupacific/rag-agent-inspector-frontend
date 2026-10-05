/** Backend calls for asking the agent (backend: app/api/ask.py). */

import { API_BASE_URL } from "../core/config";
import { ApiError, postJson } from "../core/http";
import { readSse } from "./sse";
import type { AgentResult, Step } from "./types";

export interface StreamHandlers {
  onStep: (step: Step) => void;
  onDelta: (text: string) => void;
}

const ASK_FAILED = "The agent could not answer. Ask again in a moment.";

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
