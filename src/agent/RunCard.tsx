import { formatDuration, formatNumber, plural } from "../core/format";
import Spinner from "../core/Spinner";
import { useTicker } from "../core/useTicker";
import EvaluationSummary from "../evaluation/EvaluationSummary";
import BlockedNotice from "../guardrails/BlockedNotice";
import AnswerText from "./AnswerText";
import { describeStep, stripMarkers } from "./format";
import type { Run } from "./types";

interface Props {
  run: Run;
  selected: boolean;
  onInspect: () => void;
}

/** What the agent is doing right now, in a few words. */
function currentActivity(run: Run): string {
  if (run.liveText) return "Writing the answer";
  const latest = run.liveSteps[run.liveSteps.length - 1];
  if (!latest) return "Waiting for the agent to start";
  return latest.status === "started" ? describeStep(latest) : "Working on the next step";
}

export default function RunCard({ run, selected, onInspect }: Props) {
  const { result } = run;
  const cited = result?.sources.filter((source) => source.cited) ?? [];
  const blocked = result?.blocked === true && result.guardrail !== undefined;
  const running = run.status === "running";
  const now = useTicker(running);
  const elapsed = Math.max(0, Math.round((now - run.startedAt) / 1000));

  return (
    <article className={`run${selected ? " run-selected" : ""}${blocked ? " run-blocked" : ""}`}>
      <p className="run-question">{run.question}</p>

      {running && (
        <div className="run-progress">
          <div className="progress" aria-hidden="true" />
          <p className="run-working">
            <Spinner />
            <span role="status">{currentActivity(run)}</span>
            <span className="run-elapsed" aria-hidden="true">
              {elapsed} s
            </span>
          </p>
        </div>
      )}

      <div className="run-answer" aria-live="polite">
        {running && run.liveText && <AnswerText text={stripMarkers(run.liveText)} />}
        {run.status === "error" && <p className="run-error">{run.error}</p>}
        {result && !blocked && <AnswerText text={result.answer} />}
      </div>

      {blocked && result?.guardrail && <BlockedNotice guardrail={result.guardrail} />}

      {result && cited.length > 0 && (
        <ul className="run-sources">
          {cited.map((source) => (
            <li key={source.url || source.title}>
              <span className="cite">[{source.number}]</span>
              {source.url ? (
                <a href={source.url} target="_blank" rel="noreferrer">
                  {source.title || "Source document"}
                </a>
              ) : (
                <span>{source.title || "Source document"}</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {result && blocked && (
        <dl className="run-metrics">
          <div>
            <dt>Stopped after</dt>
            <dd>{formatDuration(result.duration_ms)}</dd>
          </div>
        </dl>
      )}

      {result && !blocked && (
        <dl className="run-metrics">
          <div>
            <dt>Time</dt>
            <dd>{formatDuration(result.duration_ms)}</dd>
          </div>
          <div>
            <dt>Tokens in</dt>
            <dd>{formatNumber(result.usage.input_tokens)}</dd>
          </div>
          <div>
            <dt>Tokens out</dt>
            <dd>{formatNumber(result.usage.output_tokens)}</dd>
          </div>
          <div>
            <dt>Passages</dt>
            <dd>
              {result.counts.chunks_retrieved} found, {result.counts.chunks_cited} used
            </dd>
          </div>
        </dl>
      )}

      {run.evaluation && <EvaluationSummary evaluation={run.evaluation} />}

      {!selected && (
        <button type="button" className="quiet" onClick={onInspect}>
          Show this answer's steps{result ? ` (${plural(result.steps.length, "step")})` : ""}
        </button>
      )}
    </article>
  );
}