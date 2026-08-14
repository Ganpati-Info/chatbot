# GIS Chatbot

A lightweight Next.js app that provides a GIS-focused chatbot UI and backend API routes for interacting with geospatial services and website checks.

## Features

- Chat UI with suggested actions, conversation history, and input components.
- Server API routes for chat, lead captures, and website checks.
- Modular React components under `components/chatbot` and shared UI primitives under `components/ui`.

## Project structure

- **app/**: Next.js app directory and server routes.
  - **app/api/chat/route.ts**: Chat API endpoint.
  - **app/api/leades/route.ts**: Lead capture endpoint (note: folder name `leades` kept from repo).
  - **app/api/website-check/route.ts**: Website health/check endpoint.
- **components/chatbot/**: Chat components (Chatbot, ChatWindow, MessageList, MessageBubble, etc.).
- **components/ui/**: Reusable UI primitives (button, input, dialog, etc.).
- **lib/**: Utilities such as `pagespeed.ts` and `utils.ts`.
- **public/**: Static assets.

## Quick start

Prerequisites: Node 18+ and package manager (npm, pnpm, yarn).

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Environment

- There are no required environment variables checked into the repo. If you add API keys (for example, Pagespeed or external services), place them in a `.env.local` file and read them via `process.env` in server code.

## Development notes

- The chat UI lives in `components/chatbot`. Start by exploring [components/chatbot/Chatbot.tsx](components/chatbot/Chatbot.tsx) to see how the pieces fit together.
- Server logic is inside the Next.js route handlers in `app/api/*`.
- If adding features that call external services, prefer server-side API routes to keep keys secret.

## Testing locally

- Use the dev server (`npm run dev`) for hot reloads.
- Add simple unit tests or integration tests as needed; this repo currently has no test harness configured.

## Deployment

- Deploy to Vercel for easiest Next.js integration, or any Node.js-capable host that supports Next.js apps.

## Contributing

- Fork or branch the repo, make changes, and open a pull request. Keep changes focused and include a short description of why the change is needed.

## License

- This project does not include a license file. Add a `LICENSE` file if you intend to publish under an open-source license.

---

If you want, I can also:

- Add a short developer guide describing how to extend the chatbot and wire new backend services.
- Rename the `leades` API folder if that was a typo.
