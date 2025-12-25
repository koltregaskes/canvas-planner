# Setup

Follow these steps to get the current prototype running locally:

1. **Install tools (one-time):**
   - [Node.js 18+](https://nodejs.org/en/download) (includes `npm`).
   - [Git](https://git-scm.com/downloads) if you do not already have it.
2. **Get the project:**
   ```bash
   git clone <repo-url>
   cd canvas-planner
   ```
3. **Run it locally:**
   ```bash
   npm start
   ```
   - Leaves a small Node server running that serves the canvas and a starter `/api/tasks` endpoint.
   - Keep this terminal open so saves work.
4. **Open the app:** Visit http://localhost:3000 to use the canvas, filters, and quick-create form.

## Secrets (for Notion and Todoist later)
- Create a file named `.env` in the project root (same folder as `package.json`). Do **not** commit this file.
- Add these lines when you have tokens:
  ```env
  NOTION_TOKEN=your_notion_token
  NOTION_DATABASE_ID=your_database_id
  TODOIST_TOKEN=your_todoist_token
  ```
- Where to get them:
  - Notion token: create an integration at [Notion My Integrations](https://www.notion.so/my-integrations) and copy the **Internal Integration Token**.
  - Notion database ID: open the database in a browser and copy the long ID from the URL.
  - Todoist token: open [Todoist → Settings → Integrations → Developer](https://todoist.com/prefs/integrations) and copy the API token.
- The server will read these automatically once the API connections are wired up—no code changes needed.

## Optional: GitHub Pages preview
1. Push this repo to GitHub.
2. In **Settings → Pages**, choose the `main` branch and the `/ (root)` folder, then save.
3. The static site will go live with demo tasks. Open the full repo path (example: `https://<username>.github.io/canvas-planner/`).
   Creating tasks will stay in your browser until the API is online.
4. When you later deploy the Node server, the page will automatically switch to live mode and save tasks to the server.

## Notes
- Data saves to `data/tasks.json` for now; it is safe to edit or reset.
- Keep future secrets (Notion/Todoist tokens) in a `.env` file; do not commit it.
- We will add automated linting, tests, and AI checks (llm.tst) as we integrate APIs.
