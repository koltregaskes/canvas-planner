# Canvas Planner

Canvas Planner is an AI-ready task canvas that pulls tasks from Notion and Todoist, then shows them as moveable boxes on a modern, easy-to-use canvas. You can filter, rearrange, and edit tasks directly from the interface while keeping everything in sync.

## What this project does
- Links to your Notion database (starting with one workspace, expandable later).
- Pulls in Todoist tasks and merges them with Notion tasks.
- Shows tasks as nested boxes you can drag around on a canvas.
- Lets you filter by project, status, and hierarchy levels.
- Keeps a settings page so you can choose what fields appear in each box.
- Aims for quick edit/create actions directly in the canvas.
- Built with an AI-first mindset (automation, summarization, smart defaults).

## What exists right now
- A simple local server (no installs needed) that serves the canvas and a starter API.
- A canvas UI that shows task cards, lets you drag them, filter by source/level/status, and toggle which fields you see.
- A quick-create form to add a new task; it saves to a local JSON file when the API is running, or to your browser when offline.
- A GitHub Pages-friendly static preview that loads demo tasks and your local drafts even if the API is not live yet. Assets now respect the repo path (e.g., `/canvas-planner/`) so cards appear on Pages.
- A clear cost and limit guide (COSTS.md) so you know what each API will cost and how many calls we expect per sync.

## How to get started (step-by-step, no jargon)
1. **Install one thing:** [Node.js 18+](https://nodejs.org/en/download) (it already includes `npm`). If you do not have Git, [install it](https://git-scm.com/downloads) too.
2. **Get the files:** open a terminal and run:
   ```bash
   git clone <your-repo-url>
   cd canvas-planner
   npm install
   ```
3. **Start the app:** run `npm start`. Leave this window open; it serves the site and a small task API.
4. **Open the canvas:** go to http://localhost:3000 in your browser. You should see demo tasks you can drag, filter, and create.
5. **Run quick checks (optional but helpful):**
   - Syntax check: `npm run check`.
   - Accessibility check: in the same folder run `npm run a11y` (no server needed). This runs a simple static audit to flag missing labels or live regions.
6. **See it live on GitHub Pages (no server needed):**
   - Push the repo to GitHub.
   - In GitHub, open **Settings → Pages**, choose the **main** branch and **/** (root) folder, click Save.
   - Visit the full path with your repo name, e.g., `https://<username>.github.io/canvas-planner/`. Assets only load when the repo name is in the URL.
   - You will see “Static preview” while no API is running; demo tasks and your browser drafts still appear.
7. **Where secrets will go (for Notion/Todoist later):**
   - Copy `.env.example` to `.env` in the project root (same folder as `package.json`). Do **not** commit it.
   - Add `NOTION_TOKEN=<your_token>` and `NOTION_DATABASE_ID=<your_database_id>` after you create a Notion integration and database. Create integrations at [Notion My Integrations](https://www.notion.so/my-integrations) and find database IDs by opening the database and copying the URL ID part.
   - Add `TODOIST_TOKEN=<your_token>` after creating a token at [Todoist app settings → Integrations → Developer](https://todoist.com/prefs/integrations).
   - When these are present and the API is wired up, the server will read them automatically (no code changes needed).
8. **Need more detail?** See **SETUP.md** for screenshots/links, **USAGE.md** for controls, **ARCHITECTURE.md** for the tech plan, **ACCESSIBILITY.md** for standards/tests, **AGENTS.md** and **llms.txt** for AI-helper rules, and **PLAN.md** for progress.
9. **Wondering about costs?** Check **COSTS.md** to see expected API limits, call counts, and hosting notes.

## Current status
- ✅ Local canvas experience with drag, filter, and create.
- 🚧 Upcoming: live Notion/Todoist sync and AI helpers.

## What I need from you
- The Notion database you want synced first and permission to create a Notion integration with read access.
- Whether to reuse an existing Todoist project or create a new "Canvas Planner" project, and if labels/filters should mirror.
- The fields you care most about seeing on each task box (e.g., due date, status, priority, tags).
- If you prefer immediate sync on edit or a "Sync" button to push changes.
- Any visual references you like for a futuristic 2026-style interface.

## Key docs
- **ARCHITECTURE.md**: Technical overview and design decisions.
- **CHANGELOG.md**: Versioned history of changes.
- **SETUP.md**: Environment and setup instructions.
- **TROUBLESHOOTING.md**: Quick fixes for common issues.
- **USAGE.md**: How to use the app features.
- **PLAN.md**: Task list with emoji status markers.
- **ACCESSIBILITY.md**: Accessibility standard and how to test it.
- **AGENTS.md / llms.txt**: Rules and onboarding for AI helpers.

## Security and privacy
- We will keep API tokens in environment variables, never in code.
- Minimal scopes for Notion and Todoist integrations.
- Plan for audit logs and secure error handling in the backend.

## Design goals
- Beautiful, futuristic UI that feels like 2026.
- Smooth drag-and-drop canvas interactions.
- Automation-first (AI suggestions for priorities, summaries, and scheduling).
- Clear defaults so non-technical users can succeed quickly.
