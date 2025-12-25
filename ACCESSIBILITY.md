# Accessibility Guide

Target: WCAG 2.2 AA with WAI-ARIA Authoring Practices.

What this means (plain English):
- Keyboard works everywhere: tab order is logical, focus rings are visible, buttons/inputs are reachable without a mouse.
- Clear labels: every form control has a text label; search boxes and toggles state their purpose.
- Semantics first: use native HTML elements (buttons, inputs, headings, lists) and `aria-live` for updates.
- Colour contrast: text and UI elements meet AA contrast; avoid colour-only cues.
- Error handling: simple, descriptive messages and inline hints where possible.

Automated check (built-in)
- Tool: `npm run a11y` (static HTML scan; no server needed).
- Run: `cd canvas-planner && npm run a11y`.
- Fix anything reported (labels, aria-live, missing helper text) in `public/index.html`, then re-run.

Manual spot checks (quick)
- Tab through filters, canvas cards, and the form to ensure focus is visible and order makes sense.
- Try screen-reader-friendly text: headings describe sections; buttons state actions (e.g., "Create task").
- Resize window; content should stay usable.

Recording improvements
- Update this file, README, and PLAN when accessibility changes are made.
