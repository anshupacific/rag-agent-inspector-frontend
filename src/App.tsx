import AskPanel from "./agent/AskPanel";
import RunCard from "./agent/RunCard";
import { useAgentRuns } from "./agent/useAgentRuns";
import { useBackendStatus } from "./core/backendStatus";
import { DATASET_URL } from "./core/config";
import Header from "./layout/Header";
import Inspector from "./layout/Inspector";
import Intro from "./layout/Intro";

export default function App() {
  const backend = useBackendStatus();
  const { runs, selected, busy, askQuestion, select } = useAgentRuns();

  return (
    <div className="page">
      <Header backend={backend} />
      <div className="layout">
        <main className="conversation">
          <Intro compact={runs.length > 0} />
          <AskPanel busy={busy} compact={runs.length > 0} onAsk={askQuestion} />
          <section className="runs" aria-label="Questions asked">
            {runs.map((run) => (
              <RunCard
                key={run.id}
                run={run}
                selected={selected?.id === run.id}
                onInspect={() => select(run.id)}
              />
            ))}
          </section>
          <footer className="footnote">
            Built on Microsoft Foundry Agent Service with a Foundry IQ knowledge base. The reference guides are{" "}
            <a href={DATASET_URL} target="_blank" rel="noreferrer">
              public on GitHub
            </a>
            .
          </footer>
        </main>
        <Inspector run={selected} />
      </div>
    </div>
  );
}
