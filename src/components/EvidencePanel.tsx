import { plural } from "../lib/format";
import type { AgentResult } from "../types";

export default function EvidencePanel({ result }: { result: AgentResult }) {
  if (result.evidence.length === 0) {
    return <p className="panel-empty">The agent answered without any passages from the knowledge base.</p>;
  }
  return (
    <div className="evidence">
      {result.sources.map((source) => {
        const passages = result.evidence.filter((item) => item.url === source.url && item.title === source.title);
        return (
          <section key={source.url || source.title} className={`doc${source.cited ? " doc-cited" : ""}`}>
            <div className="doc-head">
              {source.url ? (
                <a href={source.url} target="_blank" rel="noreferrer">
                  {source.title || "Source document"}
                </a>
              ) : (
                <span>{source.title || "Source document"}</span>
              )}
              <span className={source.cited ? "badge badge-cited" : "badge badge-unused"}>
                {source.cited ? "Used in the answer" : "Found, not used"}
              </span>
            </div>
            {passages.map((passage, index) => (
              <details key={index} className="passage" open={passage.cited}>
                <summary>
                  Passage {index + 1} of {passages.length}
                  {passage.cited ? ", cited" : ""}
                </summary>
                <pre>{passage.text}</pre>
              </details>
            ))}
            {passages.length === 0 && <p className="doc-note">{plural(source.chunks, "passage")} found</p>}
          </section>
        );
      })}
    </div>
  );
}
