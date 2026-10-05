/** Shapes for the evaluation of one answer (backend: app/evaluation and app/api/evaluations.py). */

/** Rule-based: one pass/fail check that needs no model call. */
export interface Check {
  name: string;
  passed: boolean;
}

/** Rule-based: present when the question is one of the known test questions. */
export interface ExpectedAnswer {
  test_id: string;
  kind: string;
  expected: string;
  note: string | null;
  passed: boolean;
  checks: Check[];
}

/** LLM judge: one Foundry built-in evaluator's verdict on an answer. */
export interface EvaluatorScore {
  name: string;
  label: string;
  description: string;
  /** "five_point" scores 1 to 5; "pass_fail" only passes or fails, so its number is not shown. */
  scale?: "five_point" | "pass_fail" | null;
  score?: number;
  threshold?: number | null;
  passed?: boolean | null;
  reason?: string | null;
  /** Set instead of a score when the evaluator returned nothing. */
  error?: string;
}

/** Both kinds together: rule-based checks at once, the judge's scores when the run completes. */
export interface Evaluation {
  response_id: string;
  status: "running" | "completed" | "failed";
  declined: boolean;
  checks: Check[];
  expected: ExpectedAnswer | null;
  evaluators: EvaluatorScore[];
  judge_model: string;
  elapsed_ms: number;
  error: string | null;
}
