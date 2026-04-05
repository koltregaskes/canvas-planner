# Canvas Planner

Canvas Planner is a visual planning workspace for arranging tasks on a flexible board while keeping private runtime data out of the public repo.

## What works now
- A lightweight Node server serves the app and a task API with no extra dependencies.
- Private runtime data defaults to `LOCALAPPDATA\\MyData\\canvas-planner\\tasks.json` on Windows.
- The repo still includes bundled seed data for open-source previews and GitHub Pages demos.
- The UI supports search, filtering, stacked or freeform layout, create/edit/delete, parent-child links, and browser-only drafts when the API is offline.
- Offline browser drafts can be promoted into the live API once the server is available again.
- The public app shell is now installable as a lightweight PWA for desktop or Android.

## Product Direction

Canvas Planner is one of the clearest candidates to graduate into the Agent Workspace 2 hub system. The standalone tool is already useful on its own, and the same planning surface could later be migrated into the larger hub without changing the core idea.

## Run locally
1. Start the app:
   ```bash
   npm start
   ```
2. Open [http://localhost:3000](http://localhost:3000).
3. Run checks when needed:
   ```bash
   npm run check
   npm test
   ```

By default the local server now binds to `127.0.0.1`. If you ever want to expose it to your own private network later, set `HOST` explicitly to your Tailscale IP.

## Storage model
- Repo seed data: `data/tasks.json`
- Static preview data: `public/data/tasks.json`
- Private runtime data: `LOCALAPPDATA\\MyData\\canvas-planner\\tasks.json` by default

You can override the runtime location with:
- `CANVAS_PLANNER_DATA_FILE`
- `CANVAS_PLANNER_DATA_DIR`
- `MYDATA_DIR`

## GitHub Pages preview
- Pages can serve the visual frontend and bundled demo tasks.
- In preview mode, the app becomes read-only for repo seed data and stores your new drafts in browser local storage.
- When the Node server is available again, new tasks save into the private runtime store and browser drafts can be promoted into it.

## Next likely steps
- Add real Notion and Todoist sync.
- Add richer saved views and keyboard shortcuts.
- Decide whether browser drafts should auto-sync into the API or remain manual.

## Key docs
- `ARCHITECTURE.md`
- `SETUP.md`
- `USAGE.md`
- `TROUBLESHOOTING.md`
- `CHANGELOG.md`
