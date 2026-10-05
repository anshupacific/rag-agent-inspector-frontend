import { type FormEvent, useState } from "react";

/** Shown in the empty box, and asked if the visitor presses the button without typing. */
const EXAMPLE_QUESTION = "What is the currency of USA?";

interface Props {
  busy: boolean;
  onAsk: (question: string) => void;
}

/** The dark band at the top of the page: headline, question box and what each answer shows. */
export default function AskPanel({ busy, onAsk }: Props) {
  const [question, setQuestion] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    onAsk(question.trim() || EXAMPLE_QUESTION);
    setQuestion("");
  }

  return (
    <section className="ask">
      <h1>See how the agent reaches its answer</h1>

      <form className="ask-form" onSubmit={submit}>
        <label htmlFor="question">Ask about capitals, currencies, languages, landmarks or inventors</label>
        <div className="ask-row">
          <input
            id="question"
            type="text"
            value={question}
            maxLength={500}
            autoComplete="off"
            placeholder={EXAMPLE_QUESTION}
            onChange={(event) => setQuestion(event.target.value)}
          />
          <button type="submit" className="primary" disabled={busy}>
            {busy ? "Answering" : "Ask the agent"}
          </button>
        </div>
      </form>

      {/* The three colours match the three panels of the inspector. */}
      <ul className="ask-legend" aria-label="Each answer shows">
        <li className="ask-legend-lead">Each answer shows:</li>
        <li className="ask-legend-steps">its steps</li>
        <li className="ask-legend-evaluation">its evaluation</li>
        <li className="ask-legend-evidence">its evidence</li>
      </ul>
    </section>
  );
}