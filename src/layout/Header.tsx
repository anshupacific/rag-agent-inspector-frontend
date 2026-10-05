import type { BackendStatus } from "../core/backendStatus";

const STATUS_TEXT: Record<BackendStatus, string> = {
  checking: "Waking the backend, this can take a minute",
  ready: "Backend ready",
  unreachable: "Backend not reachable",
};

export default function Header({ backend }: { backend: BackendStatus }) {
  return (
    <header className="topbar">
      <span className="topbar-title">Agent Inspector</span>
      <span className={`status status-${backend}`} role="status">
        <span className="status-dot" aria-hidden="true" />
        {STATUS_TEXT[backend]}
      </span>
    </header>
  );
}
