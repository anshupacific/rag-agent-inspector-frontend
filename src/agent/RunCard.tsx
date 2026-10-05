import { formatDuration, formatNumber, plural } from "../core/format";
import EvaluationSummary from "../evaluation/EvaluationSummary";
import AnswerText from "./AnswerText";
import { stripMarkers } from "./format";
import type { Run } from "./types";

interface Props {
  run: Run;
  selected: boolean;
  onInspect: () => void;
}

export default function RunCard({ run, selected, onInspect }: Props) {
  const { result } = run;
  const cited = result?.sources.filter((source) => source.cited) ?? [];

  return (
    <article className={`run${selected ? " run-selected" : ""}`}>
      <p className="run-question">{run.question}</p>

      <div className="run-answer" aria-live="polite">
        {run.status === "running" && (
          <>
            {run.liveText ? (
              <AnswerText text={stripMarkers(run.liveText)} />
            ) : (
              <p className="run-working">The agent is working. Follow its steps in the inspector.</p>
            )}
          </>
        )}
        {run.status === "error" && <p className="run-error">{run.error}</p>}
        {result && <AnswerText text={result.answer} />}
      </div>

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

      {result && (
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
