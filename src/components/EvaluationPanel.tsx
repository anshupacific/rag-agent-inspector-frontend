import { formatDuration, formatScore } from "../lib/format";
import type { Evaluation, EvaluatorScore, ExpectedAnswer } from "../types";
import Verdict from "./Verdict";

interface Props {
  evaluation?: Evaluation;
  /** Set when the evaluation could not be requested at all. */
  requestError?: string;
}

function ExpectedCheck({ expected }: { expected: ExpectedAnswer }) {
  return (
    <li className="eval-row">
      <div className="eval-row-head">
        <span>Matches the expected answer</span>
        <Verdict passed={expected.passed} />
      </div>
      <p className="eval-detail">
        Expected: {expected.expected}
        {expected.note ? `. ${expected.note}` : ""}
      </p>
      {!expected.passed && (
        <ul className="eval-subchecks">
          {expected.checks.map((check) => (
            <li key={check.name}>
              {check.passed ? "Met" : "Not met"}: {check.name}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function EvaluatorRow({ evaluator }: { evaluator: EvaluatorScore }) {
  const scored = typeof evaluator.score === "number";
  return (
    <li className="eval-row">
      <div className="eval-row-head">
        <span>{evaluator.label}</span>
        {scored && (
          <span className="eval-score">
            <span className="eval-number">{formatScore(evaluator.score as number)}</span>
            {typeof evaluator.passed === "boolean" && <Verdict passed={evaluator.passed} />}
          </span>
        )}
      </div>
      {evaluator.description && <p className="eval-detail">{evaluator.description}</p>}
      {scored && typeof evaluator.threshold === "number" && (
        <p className="eval-detail">Passes at {formatScore(evaluator.threshold)} or higher</p>
      )}
      {scored && evaluator.reason && <p className="eval-reason">{evaluator.reason}</p>}
      {!scored && <p className="eval-detail">{evaluator.error ?? "No score was returned."}</p>}
    </li>
  );
}

export default function EvaluationPanel({ evaluation, requestError }: Props) {
  if (!evaluation) {
    return <p className="panel-empty">{requestError ?? "Starting the evaluation."}</p>;
  }

  return (
    <div className="evaluation">
      <section>
        <h3>Instant checks</h3>
        <ul className="eval-list">
          {evaluation.checks.map((check) => (
            <li key={check.name} className="eval-row">
              <div className="eval-row-head">
                <span>{check.name}</span>
                <Verdict passed={check.passed} />
              </div>
            </li>
          ))}
          {evaluation.expected && <ExpectedCheck expected={evaluation.expected} />}
        </ul>
      </section>

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
              Judged by {evaluation.judge_model} in {formatDuration(evaluation.elapsed_ms)}. Each reason is the
              judge's own explanation.
            </p>
          </>
        )}
      </section>
    </div>
  );
}