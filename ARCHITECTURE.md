# Architecture

This document explains how the Canvas Planner will work in simple terms.

## High-level picture
- **Frontend (planned):** A React/Next.js interface with a canvas view (using a library like Konva or similar) for draggable, nestable boxes. Modern styling with a 2026 look, motion, and accessibility in mind.
- **Backend (planned):** Node.js (Fastify or Express) with a typed API layer. It will host webhooks, sync jobs, and any AI helpers. Consider NestJS for structure if the project grows.
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
1. **Ingest & normalize:** Sync service fetches tasks from Notion/Todoist, normalizes them into UnifiedTask, and stores them.
2. **Canvas render:** Frontend reads UnifiedTask plus LayoutState, renders draggable nested boxes, and persists layout changes.
3. **Edit/create:**
   - **Direct edits:** Send updates back to the source app (Notion or Todoist) and the cache.
   - **Create:** Build the task in the chosen source; reflect immediately in the canvas.
   - **Limitations:** Notion property schemas must match before creating tasks; Todoist supports quick add but fewer custom fields. Validation rules will be surfaced in the UI to keep things clear.
4. **Filters & views:** Filter by project/list, status, and depth level. Add saved views for quick recall.
5. **Automation & AI (AI-first):**
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
- Scaffold frontend + backend.
- Implement Notion read-only sync, then Todoist read-only sync.
- Add unified task model + cache.
- Add canvas view with drag/drop and layout saving.
- Add edit/create flows with validation per source.
- Layer in AI helpers and prompt tests.
