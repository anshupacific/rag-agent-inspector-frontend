/** Shapes for a question, the agent's answer and how it got there (backend: app/agent). */

import type { Evaluation } from "../evaluation/types";

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

/** One question and everything that happened while answering it. */
export interface Run {
  id: string;
  question: string;
  /** When the question was asked (ms since epoch), for the "so far" counter. */
  startedAt: number;
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