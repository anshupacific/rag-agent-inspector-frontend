/** Shapes for what the agent's Foundry guardrail did (backend: app/guardrails). */

/** One risk the guardrail checked for, and what it found. */
export interface GuardrailFinding {
  id: string;
  label: string;
  description: string;
  /** True when this risk is the reason for a block. */
  flagged: boolean;
  /** For yes/no risks such as a user input attack. */
  detected: boolean | null;
  /** For graded risks such as hate or violence: "safe", "low", "medium" or "high". */
  severity: string | null;
}

/** One scan: the question going in, or the answer coming out. */
export interface GuardrailScan {
  stage: string | null;
  blocked: boolean;
  results: GuardrailFinding[];
}

export interface Guardrail {
  blocked: boolean;
  /** Where a block happened: "user_input" or "output". */
  stage: string | null;
  /** The risks that caused a block; empty when nothing was blocked. */
  risks: GuardrailFinding[];
  checks: GuardrailScan[];
  /** One sentence explaining a block. */
  message: string | null;
}