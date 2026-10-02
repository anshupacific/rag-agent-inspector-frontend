# Agent Inspector UI

React + TypeScript (Vite) frontend for the Agent Inspector backend. It shows the
agent's answer next to the steps it took and the passages it found and used.

## Layout

    src/api/            backend calls: live stream with a plain-request fallback
    src/hooks/          question state and the backend wake-up check
    src/components/     Header, Intro, AskPanel, RunCard, Inspector, StepsPanel, EvidencePanel
    src/lib/format.ts   number, duration and step-label helpers
    src/styles/         design tokens and page styles
    public/             favicon and Static Web Apps config

## Run locally

Needs Node 20 or later and the backend running on port 8000.

    npm install
    copy .env.example .env.local
    npm run dev

Open http://localhost:5173. The backend's `ALLOWED_ORIGINS` must include that address.

## Build for production

The backend URL is baked in at build time. Create `.env.production` with:

    VITE_API_BASE_URL=https://<app-name>.azurewebsites.net

Then:

    npm run build

The site is the `dist` folder.

## Deploy to Azure Static Web Apps

Create a Static Web App (Free plan), copy its deployment token from
"Manage deployment token", then:

    npx @azure/static-web-apps-cli deploy ./dist --deployment-token <token> --env production

After adding your custom domain to the Static Web App, make sure the backend's
`ALLOWED_ORIGINS` setting contains that exact origin, for example
`https://anshurag.trirect.com` (no trailing slash).

## How it talks to the backend

- `GET /health` on page load, retried for about a minute, which also wakes a sleeping backend.
- `POST /api/ask/stream` for each question, so steps appear as they happen.
- If the stream fails, one retry through `POST /api/ask`. Bad input and rate-limit
  errors are shown as they are and not retried.
