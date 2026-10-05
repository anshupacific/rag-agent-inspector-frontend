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
    styles/
  public/
```

The folders under `src/` match the backend's `app/` folders, so a feature has the same name on both sides.

## src/

`main.tsx` starts React. `App.tsx` arranges the page: the header, the question column on the left and the inspector on the right.

## src/core/

Shared plumbing used by every other folder: the backend URL, the HTTP helper that turns failures into readable messages, the check that the backend is awake, and number formatting.

## src/layout/

The page frame: the header, the intro text, and the inspector column that stacks the steps, evaluation and evidence panels. These files arrange other components and hold no logic.

## src/agent/

Asking a question and showing the answer. It calls the backend, reads the live stream of steps, keeps the list of questions asked, and draws the question box, the answer card, the steps panel and the evidence panel.

## src/evaluation/

Showing how one answer scored. It asks the backend to evaluate an answer, keeps checking until the scores arrive, and draws the evaluation panel and the one-line summary under each answer. It has two parts, one per evaluation technique.

### src/evaluation/rule_based/

Displays the instant checks that the backend runs in its own code: whether the answer cites a source and whether it matches the expected answer.

### src/evaluation/llm_judge/

Displays the scores from Foundry's built-in evaluators: the score, pass or fail, and the judge model's reason for each one, with a waiting line while Foundry is still scoring.

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
| `src/core/backendStatus.ts` | `app/api/health.py` |