# AGENT GUIDANCE

Scope: the entire repository.

- Follow the user's plain-UK-English, low-jargon style and keep explanations short and friendly.
- Keep changes small and reviewable; avoid large rewrites unless explicitly asked.
- Maintain all required docs (ARCHITECTURE, PLAN, README with How to Get Started, SETUP, USAGE, TROUBLESHOOTING, CHANGELOG, COSTS, ACCESSIBILITY, llms.txt) whenever you touch relevant areas.
- Never commit secrets; keep tokens in environment variables and provide a .env.example when new secrets are used.
- Target WCAG 2.2 AA accessibility for UI. Use semantic HTML, labelled controls, keyboard focus, and document accessibility testing steps.
- Prefer minimal dependencies; explain costs, rate limits, and efficiency choices in COSTS.md when APIs are added.
- Use repo-relative asset paths so GitHub Pages works under a subpath.
