# Changelog

## 0.1.0 - 2024-06-09
- Initial documentation scaffold (architecture, setup, usage, troubleshooting, plan).
- Defined vision for Notion and Todoist sync and canvas UI.
- Established AI-first approach and security notes.

## 0.1.1 - 2024-06-10
- Added a clear list of info needed from you to start the Notion and Todoist setup.
- Clarified preferred sync style and design references to guide the first UI draft.

## 0.2.0 - 2024-06-11
- Added a runnable Node server (no extra installs) that serves a drag-and-drop canvas UI and starter `/api/tasks` endpoint.
- Implemented filters, field toggles, and a quick-create form that saves tasks to `data/tasks.json`.
- Updated docs (README/SETUP/USAGE/PLAN/ARCHITECTURE/TROUBLESHOOTING) to explain how to run and what works now.

## 0.2.1 - 2024-06-12
- Added GitHub Pages-friendly static preview with demo data and local drafts when the API is offline.
- Added visual status indicator plus safer task creation that stores drafts locally if the server is down.
- Documented how to enable Pages, what secrets will be needed, and how to view the live preview.

## 0.2.2 - 2024-06-13
- Fixed GitHub Pages asset paths so demo tasks load at `/<repo>/` URLs and added a canvas empty state for clarity.
- Updated docs (README/SETUP/USAGE/TROUBLESHOOTING/PLAN) to remind you to open the repo path on Pages and note the new behavior.

## 0.2.3 - 2024-06-14
- Simplified "How to get started" with step-by-step setup, live URL guidance, and where to place Notion/Todoist secrets.
- Expanded SETUP with `.env` instructions and direct links to token sources.

## 0.2.4 - 2024-06-15
- Added COSTS.md covering hosting expectations plus Notion and Todoist API limits/call estimates.
- Linked the cost guide from the README for easy discovery.
- Logged the new research in PLAN history and updated the task list.
