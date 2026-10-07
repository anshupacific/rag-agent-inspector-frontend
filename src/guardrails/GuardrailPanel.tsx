import type { Guardrail, GuardrailFinding, GuardrailScan } from "./types";

const STAGE_TITLES: Record<string, string> = {
  user_input: "The question, before the agent ran",
  output: "The answer, before it was shown",
};

/** What one finding means, in a word or two, and how to colour it. */
function outcome(finding: GuardrailFinding): { text: string; tone: "flagged" | "noted" | "clear" } {
  if (finding.flagged) {
    return { text: finding.severity && finding.severity !== "safe" ? `Blocked, ${finding.severity}` : "Blocked", tone: "flagged" };
  }
  if (finding.detected === true) return { text: "Detected, allowed", tone: "noted" };
  if (finding.severity && finding.severity !== "safe") return { text: `Allowed, ${finding.severity}`, tone: "noted" };
  return { text: "Clear", tone: "clear" };
}

function Scan({ scan }: { scan: GuardrailScan }) {
  const title = (scan.stage && STAGE_TITLES[scan.stage]) || "Scan";
  const summary = scan.blocked ? "Blocked" : `${scan.results.length} checks, nothing blocked`;
  return (
    // A scan that blocked something opens by itself; clean scans stay folded to save space.
    <details className={`guard-scan${scan.blocked ? " guard-scan-blocked" : ""}`} open={scan.blocked}>
      <summary>
        <span className="guard-scan-title">{title}</span>
        <span className="guard-scan-summary">{summary}</span>
      </summary>
      <ul className="guard-list">
        {scan.results.map((finding) => {
          const { text, tone } = outcome(finding);
          return (
            <li key={finding.id}>
              <span>{finding.label}</span>
              <span className={`guard-outcome guard-outcome-${tone}`}>{text}</span>
            </li>
          );
        })}
      </ul>
    </details>
  );
}

/** The inspector panel for the guardrail: what stopped a question, or what was checked on an answer. */
export default function GuardrailPanel({ guardrail }: { guardrail: Guardrail }) {
  return (
    <div className="guard">
      {guardrail.blocked && guardrail.message && <p className="guard-message">{guardrail.message}</p>}
      {guardrail.checks.length === 0 ? (
        <p className="panel-empty">Foundry did not return details of its checks for this question.</p>
      ) : (
        guardrail.checks.map((scan, index) => <Scan key={`${scan.stage}-${index}`} scan={scan} />)
      )}
      <p className="guard-footnote">
        Enforced by Foundry with the guardrail <code>{guardrail.name}</code>, assigned to the agent.
      </p>
    </div>
  );
}