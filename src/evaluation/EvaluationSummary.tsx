import { formatScore } from "../core/format";
import Spinner from "../core/Spinner";
import type { Evaluation } from "./types";

/** One-line evaluation result under an answer; the full detail is in the inspector. */
export default function EvaluationSummary({ evaluation }: { evaluation: Evaluation }) {
  const scored = evaluation.evaluators.filter((evaluator) => typeof evaluator.score === "number");

  return (
    <ul className="run-eval" aria-label="Evaluation">
      {evaluation.expected && (
        <li className={evaluation.expected.passed ? "run-eval-pass" : "run-eval-fail"}>
          Expected answer: {evaluation.expected.passed ? "matched" : "not matched"}
        </li>
      )}
      {evaluation.status === "running" && (
        <li className="run-eval-pending">
          <Spinner /> Foundry is scoring this answer
        </li>
      )}
      {evaluation.status === "failed" && <li className="run-eval-pending">Foundry scores unavailable</li>}
      {scored.map((evaluator) => (
        <li key={evaluator.name} className={evaluator.passed === false ? "run-eval-fail" : "run-eval-pass"}>
          {evaluator.scale === "pass_fail"
            ? `${evaluator.label}: ${evaluator.passed === false ? "fail" : "pass"}`
            : `${evaluator.label} ${formatScore(evaluator.score as number)}${
                evaluator.scale === "five_point" ? " of 5" : ""
              }${evaluator.passed === false ? ", fail" : ""}`}
        </li>
      ))}
    </ul>
  );
}