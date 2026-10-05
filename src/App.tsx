import { useEffect, useRef } from "react";

import AskPanel from "./agent/AskPanel";
import RunCard from "./agent/RunCard";
import TestQuestions from "./agent/TestQuestions";
import { useAgentRuns } from "./agent/useAgentRuns";
import { useBackendStatus } from "./core/backendStatus";
import { DATASET_URL } from "./core/config";
import Disclaimer from "./layout/Disclaimer";
import Header from "./layout/Header";
import Inspector from "./layout/Inspector";

export default function App() {
  const backend = useBackendStatus();
  const { runs, selected, busy, askQuestion, select } = useAgentRuns();
  const answers = useRef<HTMLElement>(null);

  // A test question is asked from further down the page, so bring the new answer into view.
  useEffect(() => {
    const section = answers.current;
    if (!section || runs.length === 0) return;
    const { top } = section.getBoundingClientRect();
    if (top < 0 || top > window.innerHeight - 120) {
      const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      section.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
    }
  }, [runs.length]);

  return (
    <div className="page">
      <Header backend={backend} />
      <div className="layout">
        <main className="conversation">
          <AskPanel busy={busy} onAsk={askQuestion} />

          <section className="runs" aria-label="Answers" ref={answers}>
            {runs.length === 0 && (
              <p className="runs-empty">Your answer appears here, with its sources, token count and evaluation scores.</p>
            )}
            {runs.map((run) => (
              <RunCard
                key={run.id}
                run={run}
                selected={selected?.id === run.id}
                onInspect={() => select(run.id)}
              />
            ))}
          </section>

          <TestQuestions busy={busy} onAsk={askQuestion} />
          <Disclaimer />

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