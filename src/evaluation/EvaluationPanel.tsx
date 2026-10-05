import FoundryEvaluators from "./llm_judge/FoundryEvaluators";
import InstantChecks from "./rule_based/InstantChecks";
import type { Evaluation } from "./types";

interface Props {
  evaluation?: Evaluation;
  /** Set when the evaluation could not be requested at all. */
  requestError?: string;
}

/** The evaluation of one answer: rule-based checks first, then the LLM judge's scores. */
export default function EvaluationPanel({ evaluation, requestError }: Props) {
  if (!evaluation) {
    return <p className="panel-empty">{requestError ?? "Starting the evaluation."}</p>;
  }
  return (
    <div className="evaluation">
      <InstantChecks checks={evaluation.checks} expected={evaluation.expected} />
      <FoundryEvaluators evaluation={evaluation} />
    </div>
  );
}
