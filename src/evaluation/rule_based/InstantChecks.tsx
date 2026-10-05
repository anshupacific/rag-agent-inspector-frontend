import type { Check, ExpectedAnswer } from "../types";
import Verdict from "../Verdict";

/**
 * Rule-based results: checks the backend runs in its own code, with no model,
 * so they are shown as soon as the answer is given.
 */
export default function InstantChecks({ checks, expected }: { checks: Check[]; expected: ExpectedAnswer | null }) {
  return (
    <section>
      <h3>Instant checks</h3>
      <ul className="eval-list">
        {checks.map((check) => (
          <li key={check.name} className="eval-row">
            <div className="eval-row-head">
              <span>{check.name}</span>
              <Verdict passed={check.passed} />
            </div>
          </li>
        ))}
        {expected && <ExpectedCheck expected={expected} />}
      </ul>
    </section>
  );
}

/** Shown only when the question is one of the known test questions. */
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
