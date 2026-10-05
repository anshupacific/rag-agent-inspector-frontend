/**
 * Score one answer from start to finish.
 *
 * The rule-based checks come back straight away. Foundry's judge takes longer,
 * so keep asking the backend until the run is no longer "running".
 */

import { ApiError } from "../core/http";
import { getEvaluation, startEvaluation } from "./api";
import type { Evaluation } from "./types";

/** How often to ask the backend whether Foundry has finished scoring. */
const POLL_MS = 3000;
/** Stop asking after this long; the backend gives up on a run before then. */
const MAX_POLLS = 80;

export interface EvaluationHandlers {
  /** Called with every new state, including the first one. */
  onUpdate: (evaluation: Evaluation) => void;
  /** Called when the evaluation could not be requested at all. */
  onRequestError: (message: string) => void;
  /** Return false to stop polling (the page was closed). */
  isActive: () => boolean;
}

export async function runEvaluation(responseId: string, handlers: EvaluationHandlers): Promise<void> {
  let latest: Evaluation | undefined;
  try {
    latest = await startEvaluation(responseId);
    handlers.onUpdate(latest);
    for (let poll = 0; latest.status === "running" && poll < MAX_POLLS; poll += 1) {
      await new Promise((resolve) => setTimeout(resolve, POLL_MS));
      if (!handlers.isActive()) return;
      latest = await getEvaluation(responseId);
      handlers.onUpdate(latest);
    }
    if (latest.status === "running") {
      handlers.onUpdate({ ...latest, status: "failed", error: "Scoring took too long." });
    }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "This answer could not be evaluated.";
    if (latest) handlers.onUpdate({ ...latest, status: "failed", error: message });
    else handlers.onRequestError(message);
  }
}
