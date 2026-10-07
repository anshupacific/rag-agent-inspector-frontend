# Frontend folder guide

```
agent-inspector-frontend/
  src/
    main.tsx
    App.tsx
    core/
    layout/
    agent/
    evaluation/
      rule_based/
      llm_judge/
    guardrails/
    styles/
  public/
```

The folders under `src/` match the backend's `app/` folders, so a feature has the same name on both sides.

## src/

`main.tsx` starts React. `App.tsx` arranges the page: the header, the question column on the left and the inspector on the right.

## src/core/

Shared plumbing used by every other folder: the backend URL, the HTTP helper that turns failures into readable messages, the check that the backend is awake, and number formatting.

## src/layout/

The page frame: the header, the note explaining that the guides are wrong on purpose, and the inspector column that stacks the steps, guardrail, evaluation and evidence panels. These files arrange other components and hold no logic.

## src/agent/

Asking a question and showing the answer. It calls the backend, reads the live stream of steps, keeps the list of questions asked, and draws the dark ask band, the test questions, the answer card, the steps panel and the evidence panel.

## src/evaluation/

Showing how one answer scored. It asks the backend to evaluate an answer, keeps checking until the scores arrive, and draws the evaluation panel and the one-line summary under each answer. It has two parts, one per evaluation technique.

### src/evaluation/rule_based/

Displays the instant checks that the backend runs in its own code: whether the answer cites a source and whether it matches the expected answer.

### src/evaluation/llm_judge/

Displays the scores from Foundry's built-in evaluators: the score, pass or fail, and the judge model's reason for each one, with a waiting line while Foundry is still scoring.

## src/guardrails/

Showing what the agent's Foundry guardrail did. When a question is blocked, it draws the "Blocked by the guardrail" notice in place of an answer, naming the risk that fired. In the inspector it draws the Guardrail panel: the scan of the question and the scan of the answer, each listing every risk checked and whether it was clear, allowed or blocked. It makes no backend calls of its own; the data arrives with the answer.

## src/styles/

`tokens.css` holds every colour, one family per section. `app.css` holds the layout and component styles that use them.

## public/

Files served as they are: the favicon and the Static Web Apps configuration.

## Which backend folder each one talks to

| Frontend | Backend |
|---|---|
| `src/agent/` | `app/api/ask.py`, `app/agent/` |
| `src/evaluation/` | `app/api/evaluations.py`, `app/evaluation/` |
| `src/evaluation/rule_based/` | `app/evaluation/rule_based/` |
| `src/evaluation/llm_judge/` | `app/evaluation/llm_judge/` |
| `src/guardrails/` | `app/guardrails/` |
| `src/core/backendStatus.ts` | `app/api/health.py` |