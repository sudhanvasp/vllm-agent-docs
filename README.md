# vLLM Agent Docs

An **unofficial, community-run** migration of a focused subset of
[vLLM](https://github.com/vllm-project/vllm)'s documentation onto the
[Thally](https://thally.io) docs platform, built as a Track 2 hackathon
submission demonstrating agent-ready documentation. This project is not
affiliated with, endorsed by, or maintained by the vLLM project or the
PyTorch Foundation. For authoritative docs, use [docs.vllm.ai](https://docs.vllm.ai).

Content under `src/content/` and `openapi.yaml` is adapted from vLLM's
documentation, which is licensed [Apache-2.0](https://github.com/vllm-project/vllm/blob/main/LICENSE)
by the vLLM project. This repository's own scaffolding (the Thally starter
code) remains under the [MIT license](LICENSE) below.

Disclosure: Skated along with Claude Sonnet 5


What did you accomplish?
Migrated 12 scoped pages of vLLM's OpenAI-serving docs (Apache-2.0) onto Thally, replacing all starter boilerplate quickstart, a showcase "serve an OpenAI-compatible endpoint" guide, troubleshooting, a generated changelog, a scoped OpenAPI reference, engine/server args, supported models, quantization, distributed serving, Docker/K8s, and FAQ. Pushed to GitHub and connected to Thally Cloud on a custom domain, with an agent-readiness fix applied and verified along the way.

When did Thally first become useful?
Running npm run check:agents and getting back a numeric score with per-signal subscores and a named offender (/faq  no headings) instead of generic "improve your docs" advice. That's the moment it stopped feeling like a docs template and started acting like a linter for agent-readiness - fix the thing it named, rerun, confirm the number moved.

What took more manual work than expected?
The custom domain hosting could be eased out further I believe.  

What result did you trust least?
The agent-readiness score jump itself (99 → 100). A single number summarizing "is this agent-ready" is easy to satisfy
on paper (add a heading) without confirming

How did you verify that result?
Didn't take the score's word for it  independently curl'd every surface the showcase page claims to support (HTML, .md, the JSON API, embedded JSON-LD, /llms.tistered a real local MCP server, calledtools/list and read_page over JSON-RPC, and diffed what came back against the Markdown mirror by hand. Also ran thally
check --drift, which independently caught a n't been looking for  a better trust signal than the score alone.

Would you use Thally for your next real release? Why or why not?
Yes, conditionally. The core value  one MDXly to HTML, Markdown, JSON, JSON-LD, search,and MCP with no extra plumbing  genuinely worked and removes a whole class of "the docs bot's answer drifted fromdocs page" bugs. The caveats are real, thoug a rough edge, and the readiness score is afast lint, not a substitute for someone (or some agent) actually trying to use the docs, which is what caught the things the score missed.

Leveraged Claude Sonnet 5 to speed things along.  


## Agent readiness

`npm run check:agents` runs this site's `/api/agent-readiness` scan locally
(`scripts/agent-readiness.ts`):

| | Score | Content quality subscore | Offender |
|---|---|---|---|
| Baseline (13 pages published) | 99/100 (A) | 92% (12/13) | `/faq` — no headings |
| After fix | **100/100 (A)** | 100% (13/13) | — |

**Fix applied:** `/faq` was written entirely as a flat list of `<Accordion>`
components with no Markdown headings, which the content-quality subscore
penalizes. Grouping the accordions under three `##` section headings ("Serving
and models", "Output behavior", "Memory and storage") in
`src/content/faq.mdx` resolved it without changing any answer content.

## Showcase page

[`/guides/serve-openai-endpoint`](https://vllm-docs.sudhanvasp.dev/guides/serve-openai-endpoint)
is this site's designated showcase page, verified across every agent-readable
surface: HTML, the `.md` Markdown mirror, `/api/docs/guides/serve-openai-endpoint`
(JSON), embedded JSON-LD, on-site search, `/llms.txt` + `/ai.txt` +
`/api/docs-index` (agent discovery), and the read-only MCP server at `/api/mcp`.

---

A production-ready documentation site built with the open-source Thally runtime.
Use this repository as a GitHub template or clone it directly, then replace the
starter content with documentation for your product.

Thally is the product knowledge layer for software teams. This starter is its
portable publishing foundation: your content stays in Git, and the same source
can serve people, search engines, and AI tools.

This is the canonical complete template consumed by Thally Cloud, the CLI, and
the MCP server. Runtime code is authored once in
[`thallylabs/thally`](https://github.com/thallylabs/thally), then generated into
this repository as a pinned, byte-identical snapshot. Do not manually repeat a
runtime fix in both repositories.

This README covers the portable starter, not the full managed platform. The
sole production architecture authority is
[`thally-cloud/ARCHITECTURE.md`](https://github.com/thallylabs/thally-cloud/blob/main/ARCHITECTURE.md),
available to maintainers with access to the private repository. The CLI, MCP,
and Cloud creation flows consume an exact promoted scaffold release rather
than treating the mutable `main` branch as a release identity.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3040](http://localhost:3040). The next available port is
used automatically when 3040 is occupied.

## Make it yours

- Edit pages in `src/content/`.
- Organize navigation and features in `docs.json`.
- Set the product name, links, and versioned brand defaults in `src/data/site.ts`.
- Replace `openapi.yaml` with your API specification.
- Add logos or favicons in `public/` and reference them from your site settings.

`starter-release.json` records the immutable starter and runtime version used
to create the site. Keep it in the repository so `thally starter update` can
plan framework updates without overwriting your content or portable settings.

`thally starter update` performs a three-way comparison between the recorded
previous scaffold, the promoted target scaffold, and your current project. It
updates unchanged framework-owned files, preserves user-owned files, and stops
for manual review when those contracts overlap. The command is a dry run until
you pass `--apply`.

Maintainers update the generated runtime snapshot through the **Sync Thally
runtime** workflow. CI rejects a changed pin without matching files, changed
files without a matching pin, missing files, and stale runtime files.

Content icons are neutral by default. Set `appearance.contentIcons` to `accent`
in `docs.json`, or add `iconColor="accent"` to an individual card or tile.
Public page URLs ending in `.md` are disabled by default; enable them explicitly
with `markdown.enabled` when that distribution surface fits your access model.

## Validate changes

```bash
npm test
npm run build
npm ci --ignore-scripts --prefix .github/thally-tooling
.github/thally-tooling/node_modules/.bin/thally check --ci .
```

## Deploy

The site is a standard Next.js application. Deploy it through Thally Cloud or
any compatible Next.js host. Cloudflare Workers configuration is included in
`open-next.config.ts` and `wrangler.jsonc`.

Thally Cloud publishes an immutable managed site release and activates it by
moving the site's production pointer only after validation. Direct hosts use
their own release and rollback mechanisms; publishing a package or synchronizing
this starter does not move an existing site's pointer.

Copy `.env.example` to `.env.local` only when you need optional services. Never
commit real credentials.

## License

[MIT](LICENSE)
