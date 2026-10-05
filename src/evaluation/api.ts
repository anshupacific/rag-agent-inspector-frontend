/** Backend calls for evaluating one answer (backend: app/api/evaluations.py). */

import { API_BASE_URL } from "../core/config";
import { postJson, request } from "../core/http";
import type { Evaluation } from "./types";

const EVALUATION_FAILED = "This answer could not be evaluated.";

/** Start scoring an answer. Returns the rule-based checks; the judge's scores follow later. */
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
