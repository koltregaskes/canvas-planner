# Usage

This guide explains what works today and what is coming next.

## Today’s features
- **View tasks on a canvas:** Cards show sample tasks from Notion, Todoist, and Canvas sources. Drag them to rearrange.
- **Filter views:** Toggle source, level (project/task/subtask), status, and search by title or tag.
- **Visible fields:** Turn due date, priority, and source labels on/off without a page reload.
- **Create tasks:** Use the form on the right to add a task. It saves to `data/tasks.json` locally.
- **Layout controls:** Reset layout, switch auto/manual layout, and double-click a card to focus it.

## How to run
- Start the app: `npm start`
- Open: http://localhost:3000

## Coming soon
- **Edit inline:** Click a card to edit its fields and sync back to Notion/Todoist.
- **AI helpers:** Summaries, smart grouping, and prioritization with prompt tests via `llm.tst`.
- **Webhook sync:** Automatic refresh when Notion or Todoist updates.

## Data limits and considerations (for upcoming integrations)
- **Notion:** API rate limit around 3 requests/second per integration. Use batching and incremental updates.
- **Todoist:** Common rate limit around 50 requests/minute; the sync endpoint reduces calls.
- **Large workspaces:** For many tasks, we will add pagination, background sync jobs, and virtualization on the canvas for speed.
