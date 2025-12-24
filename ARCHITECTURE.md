# Architecture

This document explains how the Canvas Planner works today and where it is headed, in simple terms.

## High-level picture
- **Frontend (today):** A static HTML/CSS/JS canvas with futuristic styling. Cards are draggable, filterable, and can be created via a form. Layout saves to `localStorage`.
- **Backend (today):** A tiny Node HTTP server (no external deps) serving static files and a starter `/api/tasks` endpoint. New tasks are stored in `data/tasks.json`.
- **Frontend (planned):** Upgrade to React/Next.js with a canvas helper (Konva or similar) for richer zoom/pan and nesting. Keep the 2026 aesthetic, motion, and accessibility in mind.
- **Backend (planned):** Node.js with typed routes, webhooks, and background sync workers. Consider NestJS for structure if the project grows.
- **Data sync:**
  - **Notion:** Use the official Notion API. Start with one database, support multiple later. Respect rate limits (approx. 3 requests/second per integration; batching is crucial).
  - **Todoist:** Use the Todoist REST API. Watch rate limits (commonly ~50 requests/minute). Use incremental sync endpoints to avoid over-fetching.
  - **Storage:** Start with a SQLite or Postgres database to cache tasks and relationships. Add a queue (e.g., BullMQ) for background sync jobs.
- **Auth & secrets:** API tokens live in environment variables; never commit them. Minimize scopes and rotate tokens if possible.

## Data model (draft)
- **SourceTask:** Raw task from Notion or Todoist, stored with source metadata and last sync time.
- **UnifiedTask:** Normalized shape used by the canvas (title, status, due date, parent/child links, tags, source links).
- **LayoutState:** Positions, sizes, and layering for boxes on the canvas.
- **Settings:** User preferences for visible fields, filters, and AI assistance level.

## Key flows
1. **Serve & view (today):** Node serves static assets and `/api/tasks`. The browser renders tasks and saves layout locally.
2. **Create (today):** Form POSTs to `/api/tasks`; the server validates fields and writes them to `data/tasks.json`.
3. **Ingest & normalize (planned):** Sync service fetches tasks from Notion/Todoist, normalizes them into UnifiedTask, and stores them.
4. **Canvas render (planned):** React canvas reads UnifiedTask plus LayoutState, renders draggable nested boxes, and persists layout changes to the backend.
5. **Edit/create (planned):**
   - **Direct edits:** Send updates back to the source app (Notion or Todoist) and the cache.
   - **Create:** Build the task in the chosen source; reflect immediately in the canvas.
   - **Limitations:** Notion property schemas must match before creating tasks; Todoist supports quick add but fewer custom fields. Validation rules will be surfaced in the UI to keep things clear.
6. **Filters & views:** Filter by project/list, status, and depth level. Add saved views for quick recall.
7. **Automation & AI (AI-first):**
   - Auto-generate summaries, priorities, and links using an LLM (keep prompts in version control via `llm.tst` or similar testing harnesses).
   - Proposed MCP/skills/agent layer for reusable actions (e.g., "create task in Notion", "summarize project").
   - Plan a safety review for prompts and output checks.

## Testing & quality
- **llm.tst or similar:** Use to regression-test prompts and AI behaviors.
- **Unit tests:** For sync, normalization, and UI utilities.
- **E2E tests:** Simulate drag/drop, filtering, and edit/create flows.
- **Performance:** Debounce canvas updates and batch API calls to respect rate limits.

## Security & privacy
- Store tokens in `.env` files, not in code.
- Use HTTPS in production and signed webhooks.
- Sanitize all input and log errors without leaking secrets.

## Roadmap (short)
- ✅ Scaffold frontend + backend (initial static canvas + Node server).
- 🔍 Implement Notion read-only sync, then Todoist read-only sync.
- 🔍 Add unified task model + cache.
- 🔍 Migrate canvas to React/Next.js with zoom/pan and saved layouts.
- 🔍 Add edit/create flows with validation per source.
- 🔍 Layer in AI helpers and prompt tests.
