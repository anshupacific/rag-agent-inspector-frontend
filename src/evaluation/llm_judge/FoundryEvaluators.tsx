import { formatDuration, formatScore } from "../../core/format";
import type { Evaluation, EvaluatorScore } from "../types";
import Verdict from "../Verdict";

/**
 * LLM-judge results: scores from Foundry's built-in evaluators. Foundry takes
 * several seconds, so this shows a waiting line until the run completes.
 */
export default function FoundryEvaluators({ evaluation }: { evaluation: Evaluation }) {
  return (
    <section aria-live="polite">
      <h3>Foundry evaluators</h3>
      {evaluation.status === "running" && (
        <p className="eval-running">
          Foundry is scoring this answer with {evaluation.judge_model} as the judge
          {evaluation.elapsed_ms >= 1000 ? ` (${formatDuration(evaluation.elapsed_ms)} so far)` : ""}.
        </p>
      )}
      {evaluation.status === "failed" && (
        <p className="eval-failed">{evaluation.error ?? "Foundry could not score this answer."}</p>
      )}
      {evaluation.status === "completed" && (
        <>
          <ul className="eval-list">
            {evaluation.evaluators.map((evaluator) => (
              <EvaluatorRow key={evaluator.name} evaluator={evaluator} />
            ))}
          </ul>
          <p className="eval-footnote">
            Judged by {evaluation.judge_model} in {formatDuration(evaluation.elapsed_ms)}. Each reason is the judge's
            own explanation.
          </p>
        </>
      )}
    </section>
  );
}

function EvaluatorRow({ evaluator }: { evaluator: EvaluatorScore }) {
  const scored = typeof evaluator.score === "number";
  // A pass/fail evaluator returns 1 or 0, which would read as a low mark beside a 5.
  const showNumber = scored && evaluator.scale !== "pass_fail";
  return (
    <li className="eval-row">
      <div className="eval-row-head">
        <span>{evaluator.label}</span>
        {scored && (
          <span className="eval-score">
            {showNumber && (
              <span>
                <span className="eval-number">{formatScore(evaluator.score as number)}</span>
                {evaluator.scale === "five_point" && <span className="eval-scale"> of 5</span>}
              </span>
            )}
            {typeof evaluator.passed === "boolean" && <Verdict passed={evaluator.passed} />}
          </span>
        )}
      </div>
      {evaluator.description && <p className="eval-detail">{evaluator.description}</p>}
      {showNumber && typeof evaluator.threshold === "number" && (
        <p className="eval-detail">Passes at {formatScore(evaluator.threshold)} or higher</p>
      )}
      {scored && evaluator.reason && <p className="eval-reason">{evaluator.reason}</p>}
      {!scored && <p className="eval-detail">{evaluator.error ?? "No score was returned."}</p>}
    </li>
  );
}
