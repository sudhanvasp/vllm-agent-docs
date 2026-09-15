# Handover: vLLM Agent Docs

Status snapshot of the Track 2 hackathon build. Content work is done and
verified locally; deployment (git push, Cloudflare/domain) is left to you.

## What's built

An unofficial, agent-ready migration of a scoped subset of vLLM's docs onto
the Thally starter, replacing all starter boilerplate content.

### Pages (13 total — introduction + the 12 planned)

| Page | Path |
|---|---|
| Introduction (home) | `src/content/introduction.mdx` |
| Quickstart | `src/content/quickstart.mdx` |
| **Serve an OpenAI-compatible endpoint** (showcase page) | `src/content/guides/serve-openai-endpoint.mdx` |
| Troubleshooting | `src/content/troubleshooting.mdx` |
| Changelog (generated) | `src/content/changelog.mdx` |
| API overview | `src/content/api/introduction.mdx` |
| OpenAPI reference | `openapi.yaml` (repo root) |
| Engine arguments | `src/content/reference/engine-args.mdx` |
| Server arguments | `src/content/reference/server-args.mdx` |
| Supported models | `src/content/reference/supported-models.mdx` |
| Quantization overview | `src/content/reference/quantization.mdx` |
| Distributed serving | `src/content/guides/distributed-serving.mdx` |
| Docker & Kubernetes | `src/content/guides/docker-kubernetes.mdx` |
| FAQ | `src/content/faq.mdx` |

Every migrated page opens with a `<Note type="info" title="Source">` citing
its vLLM source doc and the Apache-2.0 license. Navigation lives in
`docs.json` (three tabs: Get started, Reference, API Reference, plus
Changelog). Site identity ("vLLM Agent Docs", unofficial-migration framing,
repo URL) is in `src/data/site.ts`. Footer license/attribution links are in
`docs.json`'s `footer` block. `AGENTS.md`'s "Product context" section
documents these conventions for future agent work on this repo.

### Removed

All Thally starter demo content was deleted: `components.mdx`,
`customization.mdx`, `guides/create-a-site.mdx`,
`guides/work-with-the-cli.mdx`, `guides/connect-ai-tools.mdx`,
`api/authentication.mdx`.

### Changelog generator

`scripts/generate-changelog.mts` (`npm run changelog:build`) pulls the
latest 8 releases from `vllm-project/vllm`'s GitHub API and regenerates
`src/content/changelog.mdx` — it's generated, not hand-written, per the
content plan. Re-run it before submission to pick up any new vLLM release.

### OpenAPI reference

`openapi.yaml` is a **hand-authored, scoped subset** of vLLM's
OpenAI-compatible server API (chat completions, completions, embeddings,
models) — not a machine pull from a live instance, since this environment
has no GPU to actually run `vllm serve`. `src/content/api/introduction.mdx`
documents the exact steps to regenerate it for real:

```bash
vllm serve Qwen/Qwen2.5-1.5B-Instruct &
curl http://localhost:8000/openapi.json -o openapi.yaml
```

If you have GPU access before submission, doing this once would make the
API reference fully authoritative instead of scoped/hand-authored — worth
doing if time allows, otherwise the current version is accurate and honest
about its scope.

## Verification already run (locally, this session)

All commands below were run from the repo root after `npm install`.

| Check | Result |
|---|---|
| `npm run build` | Clean |
| `npm test` | 427/431 pass. The 4 failures are **pre-existing bugs in the starter's own framework test suite**, not caused by content changes — see "Known issues" below. |
| `npm run lint` | 0 errors (pre-existing warnings only, in starter-owned files) |
| `npm ci --ignore-scripts --prefix .github/thally-tooling` then `thally check --ci .` | 0 errors, 0 warnings |
| `thally check --drift` | 0 errors, 0 warnings (caught and fixed one real bug — see below) |
| `npm run check:agents` (Agent Readiness) | **99/100 → 100/100** after one applied fix (see below) |
| Showcase page, all 7 agent-readable surfaces | All verified live via `npm run dev` + curl — see below |
| MCP (`claude mcp add` + JSON-RPC `initialize`/`tools/list`/`tools/call`) | Verified, then deregistered (`claude mcp remove vllm-agent-docs`) since the local dev server won't stay up |

### Agent readiness: baseline → fix → improved

| | Score | Content quality subscore | Offender |
|---|---|---|---|
| Baseline (13 pages published) | 99/100 (A) | 92% (12/13) | `/faq` — no headings |
| After fix | **100/100 (A)** | 100% (13/13) | — |

**Fix applied:** `/faq` was a flat list of `<Accordion>` components with no
Markdown headings, which the content-quality subscore penalizes. Grouped the
accordions under three `##` sections ("Serving and models", "Output
behavior", "Memory and storage") in `src/content/faq.mdx` — no answer
content changed, just structure. This is documented in `README.md` under
"Agent readiness" for the judges.

### Drift check caught a real bug

`thally check --drift` flagged a broken anchor link:
`/troubleshooting#model-architectures--are-not-supported` (double hyphen)
didn't match the actual generated heading id
`model-architectures-are-not-supported` (single hyphen). Fixed in
`src/content/reference/supported-models.mdx`. Worth re-running `--drift`
after any further content edits — it's cheap and catches this class of bug.

### Showcase page: verified across every surface

`/guides/serve-openai-endpoint` is the designated showcase page. Confirmed
live (via local dev server on port 3040):

- **HTML** — `200` on `/guides/serve-openai-endpoint`
- **Markdown** — `200` on `/guides/serve-openai-endpoint.md`
- **JSON** — `200` on `/api/docs/guides/serve-openai-endpoint`, correct frontmatter + body
- **JSON-LD** — `<script type="application/ld+json">` present in the HTML response
- **Search** — indexed; `/api/search?q=OpenAI-compatible` returns it top-ranked
- **Agent discovery** — listed in `/llms.txt`, `/ai.txt`, and `/api/docs-index`
- **MCP** — registered a local HTTP MCP server (`claude mcp add --transport http vllm-agent-docs http://localhost:3040/api/mcp`), then called `initialize`, `tools/list` (exposes `search_docs`, `read_page`, `list_pages`, `agent_readiness`), and `tools/call` → `read_page` for this exact page — content matched the Markdown mirror. Deregistered afterward with `claude mcp remove vllm-agent-docs`.

This is all captured in the "Showcase page" section of `README.md` and in
an in-page `## Agent readiness` section on the guide itself.

## Known issues / environment quirks (not content bugs)

1. **`thally` CLI Windows bug.** `.github/thally-tooling/node_modules/.bin/thally` (and `npx --prefix .github/thally-tooling thally`) fail on this machine with `'C:\Program' is not recognized...` — the CLI internally spawns a child process with `shell: true` and an unquoted path, which breaks because Node.js is installed at `C:\Program Files\nodejs` (a path with a space). **Workaround used:** created a space-free junction `C:\node-nospace` → `C:\Program Files\nodejs` and prepended it to `PATH` for these commands only:
   ```bash
   PATH="/c/node-nospace:$PATH" npx --prefix .github/thally-tooling thally check --ci .
   PATH="/c/node-nospace:$PATH" npx --prefix .github/thally-tooling thally check --drift .
   ```
   The junction is still on this machine (harmless, just a directory alias) — reuse it if you run these commands yourself. This will very likely **not** be an issue in CI (GitHub Actions Linux runners have no spaces in their Node path), so `npm run lint`/`test`/`build` in `.github/workflows/ci.yml` should be unaffected.
2. **4 pre-existing test failures**, unrelated to content:
   - `src/lib/__tests__/managed-content-build.test.ts` (2 failures): `execFileSync(...'node_modules/.bin/tsx'...)` — same Windows path-separator issue as above (`ENOENT` because the test hardcodes a POSIX-style relative path).
   - `src/lib/openapi/__tests__/fetch.test.ts` (2 failures): assertions expect `/`-separated paths in error messages but Windows produces `\`-separated ones.

   These are runtime-owned files per `AGENTS.md` ("never hand-apply a runtime fix here") — not something to patch by hand in this repo. Confirm they also fail on a fresh clone before assuming they're something you broke; if they don't reproduce in CI (Linux), they're safe to ignore for submission.

## What's left for you

Per your call on setup ownership, none of this was done:

1. `git init`, commit, and push to the new `vllm-agent-docs` GitHub repo
2. `wrangler.jsonc` — set the route/domain for `vllm-docs.sudhanvasp.dev` (currently still has the starter default `"name": "documentation-site"` and no route)
3. Cloudflare deploy (`npm run build:cloudflare && npm run deploy:cloudflare`, or via Thally Cloud) and DNS for the `vllm-docs.sudhanvasp.dev` subdomain
4. Optional: `ANTHROPIC_API_KEY` in `.env.local` for the docs chat feature (goal.md marks this skippable under time pressure)
5. Optional: `thally agent "..."` to draft the agent-readiness FAQ-heading fix as a reviewed PR, if you want that workflow itself as a demonstration of agent-readiness (the fix is already applied directly to the working tree — this would just be about *how* it got there)
6. Re-run `npm run changelog:build` right before final submission if you want the freshest vLLM release in the changelog
7. Bonus: a responsive + dark-mode pass — not explicitly tested this session

## Verification checklist status (from goal.md)

- [x] Clean install → check → build succeeds (build/lint/test/`thally check --ci` all clean; see workaround note above for running `thally` on Windows)
- [x] 13 substantive pages live with working navigation (`docs.json`)
- [x] Quickstart, task guide, troubleshooting, changelog all present
- [x] OpenAPI reference present (scoped/hand-authored — see note above)
- [x] Code examples, links, media included (curl/Python snippets throughout, internal cross-links verified by drift check; no images/diagrams added)
- [x] Agent Readiness report captured (99 → 100, one applied fix, documented in README)
- [x] Showcase guide verified across HTML/MD/JSON/JSON-LD/search/agent index/MCP
- [ ] Deployed and reachable at `vllm-docs.sudhanvasp.dev` — **not done, yours to finish**
- [ ] Responsive + dark-mode pass (bonus) — not explicitly tested
