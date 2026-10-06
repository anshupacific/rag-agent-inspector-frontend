import Spinner from "../core/Spinner";
import { describeStep, stepName } from "./format";
import type { Step } from "./types";

export default function StepsPanel({ steps, running }: { steps: Step[]; running: boolean }) {
  if (steps.length === 0) {
    return running ? (
      <p className="panel-waiting">
        <Spinner /> Waiting for the agent's first step
      </p>
    ) : (
      <p className="panel-empty">No steps were reported.</p>
    );
  }
  return (
    <ol className="steps">
      {steps.map((step, index) => {
        const active = step.status === "started";
        const search = step.type === "mcp_call";
        return (
          <li key={step.index ?? index} className={`step${active ? " step-active" : ""}${search ? " step-search" : ""}`}>
            <span className="step-number" aria-hidden="true">
              {index + 1}
            </span>
            <div>
              <span className="step-text">{describeStep(step)}</span>
              <code className="step-name">{stepName(step)}</code>
            </div>
          </li>
        );
      })}
    </ol>
  );
}