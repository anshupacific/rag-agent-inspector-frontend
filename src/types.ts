/** Shapes returned by the backend (see backend/app/response_parser.py and app/main.py). */

export interface Source {
  number: number;
  title: string;
  url: string;
  cited: boolean;
  chunks: number;
}

export interface Evidence {
  title: string;
  url: string;
  text: string;
  cited: boolean;
}

export interface Step {
  type: string;
  name?: string;
  failed?: boolean;
  chunks?: number;
  /** Present on live (streamed) steps only. */
  index?: number;
  status?: "started" | "done";
}

export interface AgentResult {
  answer: string;
  sources: Source[];
  evidence: Evidence[];
  steps: Step[];
  usage: {
    input_tokens: number | null;
    output_tokens: number | null;
    total_tokens: number | null;
  };
  counts: { chunks_retrieved: number; chunks_cited: number };
  agent: { name: string; version: string };
  duration_ms: number;
  response_id: string | null;
}

/** One pass/fail check that needs no model call. */
export interface Check {
  name: string;
  passed: boolean;
}

/** Present when the question is one of the known test questions. */
export interface ExpectedAnswer {
  test_id: string;
  kind: string;
  expected: string;
  note: string | null;
  passed: boolean;
  checks: Check[];
}

/** One Foundry built-in evaluator's verdict on an answer. */
export interface EvaluatorScore {
  name: string;
  label: string;
  description: string;
  score?: number;
  threshold?: number | null;
  passed?: boolean | null;
  reason?: string | null;
  /** Set instead of a score when the evaluator returned nothing. */
  error?: string;
}

/** Evaluation of one answer: instant checks now, Foundry's scores when the run completes. */
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

/** One question and everything that happened while answering it. */
export interface Run {
  id: string;
  question: string;
  status: "running" | "done" | "error";
  /** Answer text as it streams in, before the final result arrives. */
  liveText: string;
  /** Steps seen so far while streaming. */
  liveSteps: Step[];
  result?: AgentResult;
  error?: string;
  /** Filled in after the answer; updated while Foundry is still scoring. */
  evaluation?: Evaluation;
  /** Shown when the evaluation could not be requested at all. */
  evaluationError?: string;
}

export type BackendStatus = "checking" | "ready" | "unreachable";