/** Explains why the agent's answers look wrong, so nobody reads them as a bug. */
export default function Disclaimer() {
  return (
    <aside className="disclaimer">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <circle cx="10" cy="10" r="8" />
        <path d="M10 9v5" />
        <path d="M10 6.2v.1" />
      </svg>
      <p>
        <strong>The answers look wrong on purpose.</strong> This agent answers only from five reference guides, and the
        guides contain deliberately wrong facts. When it says the capital of India is Mumbai, it is reading the
        document, not guessing.
      </p>
    </aside>
  );
}