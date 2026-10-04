/** `compact` drops the explanation once the visitor has asked a first question. */
export default function Intro({ compact }: { compact: boolean }) {
  return (
    <section className="intro">
      <h1>See how the agent reaches its answer</h1>
      {!compact && (
        <p>
          This agent answers only from five reference guides, and the guides contain deliberately wrong facts. When it
          says the capital of India is Mumbai, it is reading the document, not guessing. Ask a question and the inspector
          shows each step, the passages it found and used, and how the answer scores.
        </p>
      )}
    </section>
  );
}