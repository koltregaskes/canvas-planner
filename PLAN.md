# Plan & Progress

Emoji legend: ✅ done, 🚧 in progress, 🔍 research, 🟢 planned, ⏸️ blocked.

## Done
- ✅ Documented project vision and setup basics (this commit).
- ✅ Scaffolded a local Node server with a drag-and-drop canvas, filters, and create form that writes to `data/tasks.json`.
- ✅ Added a GitHub Pages-friendly static preview with fallback demo data and local drafts.
- ✅ Fixed GitHub Pages asset paths so demo cards load at `/<repo>/`, and added a blank-state message.
- ✅ Added a dummy-proof "How to get started" with secret placement instructions.

## Now
- 🚧 Test the canvas locally with your tasks to see if the layout and controls feel right.
- 🚧 Turn on GitHub Pages (Settings → Pages → main branch, root) so you can see the static preview live.
- 🔍 Validate Notion/Todoist API limits and webhook capabilities; note any quota edge cases.

## What I need from you
- Turn on GitHub Pages (main branch, root) so you can see the live static preview URL.
- Which Notion database to start with (a shareable link or the database name) and permission to create a Notion integration with "read content" scope.
- Todoist: your account email and whether I should create a new "Canvas Planner" project or reuse an existing one; confirm if labels/filters should be mirrored.
- Secrets (when ready): Notion integration token + database ID, Todoist token; we will place them in `.env` and never commit.
- Any must-have fields you want visible on the boxes (e.g., due date, status, project, priority, tags).
- Whether task edits/creates should sync back immediately or only after you press a "Sync" button.
- Any design references you like for a 2026-style UI (so the canvas theme matches your taste).

## Next
- 🟢 Migrate the canvas to React/Next.js for richer zoom/pan and accessibility.
- 🟢 Add Notion read-only sync for a single database; normalize into UnifiedTask.
- 🟢 Add Todoist read-only sync and merge into UnifiedTask list.
- 🟢 Persist LayoutState and settings in the backend.
- 🟢 Implement filtering (project/list, status, depth) and saved views.
- 🟢 Add edit/create flows with validation for Notion schema and Todoist fields.
- 🟢 Wire AI helpers (summaries, prioritization) with prompt tests (llm.tst) and an MCP/skills/agent layer.

## Later
- 🟢 Multi-Notion-database support and multi-account handling.
- 🟢 Offline-friendly caching and optimistic UI updates for the canvas.
- 🟢 Advanced automation (recurring sync, smart grouping suggestions, conflict resolution UI).
- 🟢 Analytics for sync performance and rate-limit handling.

## History
- 2024-06-09: Initial planning docs added.
- 2024-06-10: Added list of info needed from you to begin integrations and UI fit.
- 2024-06-11: Added runnable canvas prototype with filters and create form.
- 2024-06-13: Fixed GitHub Pages asset paths and added empty-state guidance for the canvas.
- 2024-06-14: Added step-by-step getting-started and secrets guidance for Notion/Todoist.
