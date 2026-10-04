import { useCallback, useEffect, useRef, useState } from "react";

import { ApiError, askWithFallback, getEvaluation, startEvaluation } from "../api/client";
import type { Run, Step } from "../types";

/** How often to ask the backend whether Foundry has finished scoring. */
const POLL_MS = 3000;
/** Stop asking after this long; the backend gives up on a run before then. */
const MAX_POLLS = 80;

function upsertStep(steps: Step[], step: Step): Step[] {
  const at = steps.findIndex((existing) => existing.index === step.index);
  if (at === -1) return [...steps, step].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  const next = steps.slice();
  next[at] = { ...next[at], ...step };
  return next;
}

/** Holds every question asked in this visit and runs new ones. Newest first. */
export function useAgentRuns() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const update = useCallback((id: string, change: (run: Run) => Run) => {
    setRuns((current) => current.map((run) => (run.id === id ? change(run) : run)));
  }, []);

  /**
   * Score one answer. The instant checks come back straight away; Foundry's
   * evaluators take longer, so keep asking until the run is no longer "running".
   * This never blocks the visitor from asking the next question.
   */
  const evaluate = useCallback(
    async (id: string, responseId: string) => {
      try {
        let evaluation = await startEvaluation(responseId);
        update(id, (run) => ({ ...run, evaluation }));
        for (let poll = 0; evaluation.status === "running" && poll < MAX_POLLS; poll += 1) {
          await new Promise((resolve) => setTimeout(resolve, POLL_MS));
          if (!mounted.current) return;
          evaluation = await getEvaluation(responseId);
          update(id, (run) => ({ ...run, evaluation }));
        }
        if (evaluation.status === "running") {
          const stalled = { ...evaluation, status: "failed" as const, error: "Scoring took too long." };
          update(id, (run) => ({ ...run, evaluation: stalled }));
        }
      } catch (error) {
        const message = error instanceof ApiError ? error.message : "This answer could not be evaluated.";
        update(id, (run) =>
          run.evaluation
            ? { ...run, evaluation: { ...run.evaluation, status: "failed", error: message } }
            : { ...run, evaluationError: message },
        );
      }
    },
    [update],
  );

  const askQuestion = useCallback(
    async (question: string) => {
      const text = question.trim();
      if (!text || busy) return;
      const id = crypto.randomUUID();
      setRuns((current) => [
        { id, question: text, status: "running", liveText: "", liveSteps: [] },
        ...current,
      ]);
      setSelectedId(id);
      setBusy(true);
      try {
        const result = await askWithFallback(text, {
          onStep: (step) => update(id, (run) => ({ ...run, liveSteps: upsertStep(run.liveSteps, step) })),
          onDelta: (delta) => update(id, (run) => ({ ...run, liveText: run.liveText + delta })),
        });
        update(id, (run) => ({ ...run, status: "done", result }));
        if (result.response_id) void evaluate(id, result.response_id);
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : "Something went wrong in the page. Reload and ask again.";
        update(id, (run) => ({ ...run, status: "error", error: message }));
      } finally {
        setBusy(false);
      }
    },
    [busy, update, evaluate],
  );

  const selected = runs.find((run) => run.id === selectedId) ?? runs[0] ?? null;
  return { runs, selected, busy, askQuestion, select: setSelectedId };
}