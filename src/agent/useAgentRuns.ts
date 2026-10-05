import { useCallback, useEffect, useRef, useState } from "react";

import { ApiError } from "../core/http";
import { runEvaluation } from "../evaluation/runEvaluation";
import { askWithFallback } from "./api";
import type { Run, Step } from "./types";

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
        if (result.response_id) {
          // Scoring runs on its own; the visitor can ask the next question meanwhile.
          void runEvaluation(result.response_id, {
            onUpdate: (evaluation) => update(id, (run) => ({ ...run, evaluation })),
            onRequestError: (message) => update(id, (run) => ({ ...run, evaluationError: message })),
            isActive: () => mounted.current,
          });
        }
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : "Something went wrong in the page. Reload and ask again.";
        update(id, (run) => ({ ...run, status: "error", error: message }));
      } finally {
        setBusy(false);
      }
    },
    [busy, update],
  );

  const selected = runs.find((run) => run.id === selectedId) ?? runs[0] ?? null;
  return { runs, selected, busy, askQuestion, select: setSelectedId };
}
