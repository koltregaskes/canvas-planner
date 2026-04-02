# Changelog

## 0.3.0 - 2026-04-01
- Finished the private-data runtime path so live task edits default to `LOCALAPPDATA\MyData\canvas-planner\tasks.json`.
- Replaced the prototype frontend with a launch-ready board/editor experience, including stacked and freeform layouts, responsive mobile behavior, and proper edit/delete flows.
- Fixed the static preview loader so bundled demo data works on GitHub Pages again.
- Added cleanup for invalid legacy task records and detached child tasks safely when a parent is deleted.
- Added Node tests for the task store and HTTP request handler.

## 0.2.2 - 2024-06-13
- Fixed GitHub Pages asset paths so demo tasks load at `/<repo>/` URLs and added a canvas empty state for clarity.
- Updated docs to remind you to open the repo path on Pages and note the new behavior.

## 0.2.1 - 2024-06-12
- Added GitHub Pages-friendly static preview with demo data and local drafts when the API is offline.
- Added visual status indicator plus safer task creation that stores drafts locally if the server is down.

## 0.2.0 - 2024-06-11
- Added a runnable Node server that serves a drag-and-drop canvas UI and starter `/api/tasks` endpoint.
- Implemented filters, field toggles, and a quick-create form that saved tasks to a local JSON file.

## 0.1.1 - 2024-06-10
- Added the info needed to start the Notion and Todoist setup.

## 0.1.0 - 2024-06-09
- Initial documentation scaffold and project vision.
