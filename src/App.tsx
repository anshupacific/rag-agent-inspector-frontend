import AskPanel from "./components/AskPanel";
import Header from "./components/Header";
import Inspector from "./components/Inspector";
import Intro from "./components/Intro";
import RunCard from "./components/RunCard";
import { DATASET_URL } from "./config";
import { useAgentRuns } from "./hooks/useAgentRuns";
import { useBackendStatus } from "./hooks/useBackendStatus";

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
