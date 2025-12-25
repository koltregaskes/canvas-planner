# Setup

Follow these steps to get the current prototype running locally:

1. **Install tools:** Node.js 18+ and Git. No extra packages are required yet.
2. **Clone the repo:**
   ```bash
   git clone <repo-url>
   cd canvas-planner
   ```
3. **Start the local server:**
   ```bash
   npm start
   ```
   This starts a lightweight Node server that serves the canvas UI and a starter `/api/tasks` endpoint.
4. **Open the app:** Visit http://localhost:3000 to see the canvas, filters, and quick-create form.

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
