# Goal: vLLM Agent Docs (Hackathon Track 2)

## Objective
Build and deploy an agent-ready documentation site migrating vLLM's docs onto the Thally platform, meeting Track 2's submission rubric. Time budget: single sprint (few hours). Scope tightly — do not attempt to port all of vLLM's docs.

## Identity
- Repo: `vllm-agent-docs` (new GitHub repo, owned by user)
- Site title: "vLLM Agent Docs" — must read as an unofficial/community migration, not an official vLLM property (vLLM is a PyTorch Foundation project; avoid trademark-confusing branding)
- Deploy domain: `vllm-docs.sudhanvasp.dev` (Cloudflare-managed; existing pattern is `proxmox.sudhanvasp.dev`)
- Source license basis: vLLM docs are Apache-2.0, reuse/modification permitted — cite this in the site footer or README

## Setup
1. `npx degit thallylabs/starter vllm-agent-docs` (or `npx create-thally-docs`)
2. Push to the new `vllm-agent-docs` GitHub repo
3. Read the starter's own `AGENTS.md` before making any content changes — it contains the platform's own agent instructions
4. `npm install && npm run dev` — confirm this works clean before building anything else; "clean clone, install, check, build" is a graded requirement
5. In `docs.json`, set `"markdown": { "enabled": true }`
6. Set up `wrangler.jsonc` for Cloudflare deploy targeting `vllm-docs.sudhanvasp.dev`
7. (Optional) Set `ANTHROPIC_API_KEY` in `.env` for the docs chat feature — skip if time-pressed, trial key works

## Content plan — 12 pages, sourced from vLLM's actual docs (docs.vllm.ai)
1. **Quickstart** — installation + first `vllm serve` command
2. **Task guide: Serve an OpenAI-compatible endpoint** — designate this as the showcase page (see Verification below)
3. **Troubleshooting** — migrate vLLM's existing troubleshooting page
4. **Changelog** — generate from vLLM's GitHub releases, don't hand-write
5. **OpenAPI reference** — pull live `/openapi.json` from a running `vllm serve` instance; serves as the structured technical reference
6. **Engine arguments** (from `configuration/engine_args`) — auto-generated reference, good structured-content test case
7. **Server arguments** (from `configuration/serve_args`)
8. **Supported models**
9. **Quantization overview**
10. **Distributed/parallelism guide** — tensor/pipeline parallel basics
11. **Docker/K8s deployment guide**
12. **FAQ**

Code examples: use vLLM's own canonical curl/Python OpenAI-compatible snippets rather than writing new ones.

## Agent-readiness requirements
- Run `/api/agent-readiness` once several pages are up, record the baseline score
- Apply one concrete fix based on the scan, re-run, record the improved score — this is the "reviewed readiness improvement" deliverable
- Designate page #2 (serving task guide) as the one guide verified across **all** required surfaces: HTML, Markdown, JSON, JSON-LD, search, agent index, and MCP
  - Test MCP locally: `claude mcp add --transport http /api/mcp`
  - Confirm the page resolves via `/llms.txt`, `/ai.txt`, `/api/docs-index`, `/api/docs/{slug}`
- Run `thally check --drift` before submission to catch stale/broken pages

## Verification checklist (must pass before submission)
- [ ] Clean clone → install → check → build succeeds from the repo as-is
- [ ] 10+ substantive pages live with working navigation (docs.json)
- [ ] Quickstart, task guide, troubleshooting, changelog all present
- [ ] OpenAPI reference (or equivalent structured technical reference) present
- [ ] Code examples, links, media included
- [ ] Agent Readiness report captured (before/after score) with one applied improvement
- [ ] Showcase guide verified across HTML/MD/JSON/JSON-LD/search/agent index/MCP
- [ ] Deployed and reachable at `vllm-docs.sudhanvasp.dev`
- [ ] Responsive + dark-mode pass (bonus, not required)

## Notes for the implementing agent
- Prioritize the verification checklist over content volume — judges can score agent-readiness mechanics objectively; extra pages beyond ~12 don't help.
- Use `thally agent "..."` to draft the agent-readiness improvement as a reviewed PR where practical, since that workflow is itself a demonstration of agent-readiness.