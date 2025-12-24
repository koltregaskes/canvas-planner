# Usage

This guide will be updated as features are built. Here is what to expect.

## Planned workflows
- **View tasks on a canvas:** Drag boxes to arrange them; zoom and pan to navigate.
- **Filter views:** Choose project/list, status, and hierarchy depth. Save favorite views.
- **Edit and create:** Click a box to edit key fields; use a quick-add form to create tasks in Notion or Todoist.
- **Settings page:** Pick which fields show in boxes (due date, status, tags, project) and toggle AI helpers.
- **AI helpers:** Summaries, auto-prioritization, and suggestions for grouping. Prompts will be tested via `llm.tst` or similar.

## Near-term commands (will be added once code exists)
- `pnpm dev` — start the dev server.
- `pnpm test` — run automated tests (including AI prompt tests when configured).
- `pnpm sync:notion` / `pnpm sync:todoist` — manual sync commands.

## Data limits and considerations
- **Notion:** API rate limit around 3 requests/second per integration. Use batching and incremental updates.
- **Todoist:** Common rate limit around 50 requests/minute; the sync endpoint reduces calls.
- **Large workspaces:** For many tasks, we will add pagination, background sync jobs, and virtualization on the canvas for speed.
