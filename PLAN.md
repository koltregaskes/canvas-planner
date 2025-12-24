# Plan & Progress

Emoji legend: ✅ done, 🚧 in progress, 🔍 research, 🟢 planned, ⏸️ blocked.

## Done
- ✅ Documented project vision and setup basics (this commit).

## Now
- 🔍 Confirm front-end stack (Next.js + React + canvas library like Konva) and pick a UI kit that fits a 2026 aesthetic.
- 🔍 Validate Notion/Todoist API limits and webhook capabilities; note any quota edge cases.

## What I need from you
- Which Notion database to start with (a shareable link or the database name) and permission to create a Notion integration with "read content" scope.
- Your Todoist account email and whether I should create a new "Canvas Planner" project or reuse an existing one; confirm if labels/filters should be mirrored.
- Any must-have fields you want visible on the boxes (e.g., due date, status, project, priority, tags).
- Whether task edits/creates should sync back immediately or only after you press a "Sync" button.
- Any design references you like for a 2026-style UI (so the canvas theme matches your taste).

## Next
- 🟢 Scaffold frontend with canvas placeholder and modern design system tokens.
- 🟢 Scaffold backend API with health check, config loader, and logging.
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
