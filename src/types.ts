/** Shapes returned by the backend (see backend/app/response_parser.py). */

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
  status: "running" | "done" | "error";
  /** Answer text as it streams in, before the final result arrives. */
  liveText: string;
  /** Steps seen so far while streaming. */
  liveSteps: Step[];
  result?: AgentResult;
  error?: string;
}

export type BackendStatus = "checking" | "ready" | "unreachable";
