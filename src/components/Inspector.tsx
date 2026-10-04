import type { Run } from "../types";
import EvaluationPanel from "./EvaluationPanel";
import EvidencePanel from "./EvidencePanel";
import StepsPanel from "./StepsPanel";

/** The right-hand column. Each section is its own coloured panel: steps, evaluation, evidence. */
export default function Inspector({ run }: { run: Run | null }) {
  if (!run) {
    return (
      <aside className="inspector" aria-label="Agent inspector">
        <section className="panel panel-steps">
          <header className="panel-head">
            <h2>What the agent did</h2>
          </header>
          <div className="panel-body">
            <p className="panel-empty">Ask a question and each step the agent takes appears here as it happens.</p>
          </div>
        </section>
      </aside>
    );
  }

  const { result } = run;
  const steps = result ? result.steps : run.liveSteps;

  return (
    <aside className="inspector" aria-label="Agent inspector">
      <section className="panel panel-steps">
        <header className="panel-head">
          <h2>What the agent did</h2>
          <p>{run.question}</p>
        </header>
        <div className="panel-body">
          <StepsPanel steps={steps} running={run.status === "running"} />
        </div>
      </section>

      {result && result.response_id && (
        <section className="panel panel-evaluation">
          <header className="panel-head">
            <h2>Evaluation</h2>
            <p>How this one answer scores, checked right after it was given</p>
          </header>
          <div className="panel-body">
            <EvaluationPanel evaluation={run.evaluation} requestError={run.evaluationError} />
          </div>
        </section>
      )}

      {result && (
        <section className="panel panel-evidence">
          <header className="panel-head">
            <h2>Evidence</h2>
            <p>
              {result.counts.chunks_retrieved} passages found, {result.counts.chunks_cited} used in the answer
            </p>
          </header>
          <div className="panel-body">
            <EvidencePanel result={result} />
            <p className="inspector-agent">
              Answered by <code>{result.agent.name}</code> version {result.agent.version}
            </p>
          </div>
        </section>
      )}
    </aside>
  );
}