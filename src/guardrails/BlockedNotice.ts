import type { Guardrail } from "./types";

/** Shown in the answer card when the guardrail stopped the question: there is no answer to show. */
export default function BlockedNotice({ guardrail }: { guardrail: Guardrail }) {
  return (
    <div className="blocked" role="status">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3l7 3v5c0 4.6-2.9 8.2-7 10-4.1-1.8-7-5.4-7-10V6l7-3z" />
        <path d="M9 9l6 6M15 9l-6 6" />
      </svg>
      <div className="blocked-text">
        <p className="blocked-title">Blocked by the guardrail</p>
        {guardrail.message && <p>{guardrail.message}</p>}
        {guardrail.risks.length > 0 && (
          <ul className="blocked-risks" aria-label="Reason">
            {guardrail.risks.map((risk) => (
              <li key={risk.id}>
                {risk.label}
                {risk.severity && risk.severity !== "safe" ? ` (${risk.severity})` : ""}
              </li>
            ))}
          </ul>
        )}
        <p className="blocked-source">
          Guardrail: <code>{guardrail.name}</code>
        </p>
      </div>
    </div>
  );
}