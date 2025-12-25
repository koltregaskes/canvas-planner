# Costs and API Limits

This project is cheap to run right now. Here is what to expect and how many calls we will make when we start syncing with Notion and Todoist.

## Quick view
- Local preview: free (Node.js server on your machine).
- GitHub Pages: free static hosting for the canvas preview.
- Notion API: $0, but rate limited to ~3 requests per second per integration. We will batch to avoid spikes.
- Todoist API: $0, but rate limited to about 50 requests per minute per user. We will back off automatically if needed.
- Future AI features: depends on the provider (OpenAI, Anthropic, etc.). We can pick a low-cost model and cap usage.

## Notion API costs and call estimate
- **Money**: No per-call cost from Notion. Your existing Notion plan (even free) works for basic reads/writes.
- **Limits**: ~3 requests/second per integration. Each request can fetch up to 100 rows.
- **Typical calls per sync** (assume 500 tasks):
  - Read database pages: ~5 calls (100 rows each).
  - Fetch page properties/details: usually included in the page result; no extra call unless we fetch child blocks.
  - Write updates (when edits are enabled): 1 call per changed task.
- **What we will do**: paginate reads (100 items per call), cache unchanged pages, and throttle to stay under 3 req/sec.

## Todoist API costs and call estimate
- **Money**: No per-call cost from Todoist. Free or Pro accounts both allow API access.
- **Limits**: About 50 requests/minute per user (hard cap). Bulk sync endpoints reduce calls.
- **Typical calls per sync** (assume 500 tasks):
  - Sync read (all tasks + projects): 1–2 calls using the `/sync` endpoint with resource types.
  - Writes: 1 call per created/updated task; batch endpoints can group multiple operations.
- **What we will do**: use bulk sync, group writes, and retry slowly if a 429 (rate limit) appears.

## Hosting and infrastructure
- **Local server**: free; uses the Node.js runtime you install.
- **GitHub Pages**: free static hosting; great for showing the canvas without the API.
- **Server with API**: if you later host the Node server, expect cost from your chosen host (e.g., small VM). We can keep it tiny by sleeping when idle.

## Future AI feature costs
- No AI calls are made yet. When we add them:
  - Choose a budget-friendly model (e.g., small GPT or Claude model) for summaries and prioritization.
  - Add a daily/monthly spend cap and log usage per request.
  - Keep prompts short and reuse context to lower token use.

## How to stay within limits
- Turn on sync only when you need it; scheduled syncs can run hourly to avoid bursts.
- Keep batch sizes at 100 items for Notion and use Todoist bulk sync to cut calls.
- Watch for rate-limit responses (429). The code will retry with backoff once enabled.
