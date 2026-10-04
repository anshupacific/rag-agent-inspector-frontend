import type { Run } from "../types";
import EvaluationPanel from "./EvaluationPanel";
import EvidencePanel from "./EvidencePanel";
import StepsPanel from "./StepsPanel";

export default function Inspector({ run }: { run: Run | null }) {
  if (!run) {
    return (
      <aside className="inspector" aria-label="Agent inspector">
        <h2>What the agent did</h2>
        <p className="panel-empty">Ask a question and each step the agent takes appears here as it happens.</p>
      </aside>
    );
  }

  const { result } = run;
  const steps = result ? result.steps : run.liveSteps;

  return (
    <aside className="inspector" aria-label="Agent inspector">
      <div className="inspector-head">
        <h2>What the agent did</h2>
        <p className="inspector-question">{run.question}</p>
      </div>

      <StepsPanel steps={steps} running={run.status === "running"} />

      {result && result.response_id && (
        <>
          <div className="inspector-head">
            <h2>Evaluation</h2>
            <p className="inspector-count">How this one answer scores, checked right after it was given</p>
          </div>
          <EvaluationPanel evaluation={run.evaluation} requestError={run.evaluationError} />
        </>
      )}

      {result && (
        <>
          <div className="inspector-head">
            <h2>Evidence</h2>
            <p className="inspector-count">
              {result.counts.chunks_retrieved} passages found, {result.counts.chunks_cited} used in the answer
            </p>
          </div>
          <EvidencePanel result={result} />
          <p className="inspector-agent">
            Answered by <code>{result.agent.name}</code> version {result.agent.version}
          </p>
        </>
      )}
    </aside>
  );
}