/**
 * Generates src/content/changelog.mdx from vLLM's GitHub releases.
 *
 * Per the site's content policy, the changelog is generated, not
 * hand-written — this script is the source of truth for that page. Re-run
 * it (`npm run changelog:build`) to pick up new vLLM releases.
 */
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const REPO = 'vllm-project/vllm'
const RELEASE_COUNT = 8
const OUTPUT_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../src/content/changelog.mdx',
)

interface GithubRelease {
  tag_name: string
  html_url: string
  published_at: string
  body: string | null
}

const MAX_BULLET_LENGTH = 220

function firstSentence(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, ' ')
  const match = trimmed.match(/^.*?[.!?](?=\s|$)/)
  const sentence = match ? match[0] : trimmed
  if (sentence.length <= MAX_BULLET_LENGTH) return sentence
  const truncated = sentence.slice(0, MAX_BULLET_LENGTH)
  return `${truncated.slice(0, truncated.lastIndexOf(' '))}…`
}

/** Pull the top-level bullets under a release's "## Highlights" section, if present. */
function extractHighlights(body: string | null, max = 4): Array<string> {
  if (!body) return []
  const lines = body.split('\n')
  const start = lines.findIndex((line) => /^##\s*highlights/i.test(line.trim()))
  if (start === -1) return []
  const bullets: Array<string> = []
  for (const line of lines.slice(start + 1)) {
    const trimmed = line.trim()
    if (/^##\s/.test(trimmed)) break
    if (/^[*-]\s+/.test(trimmed)) {
      const text = trimmed
        .replace(/^[*-]\s+/, '')
        .replace(/\*\*/g, '')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\s*\(#\d+(?:[,;]?\s*#\d+)*\)/g, '')
        .replace(/\s+([,.;:])/g, '$1')
        .trim()
      if (text) bullets.push(firstSentence(text))
    }
    if (bullets.length >= max) break
  }
  return bullets
}

function formatDate(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10)
}

async function main() {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/releases?per_page=${RELEASE_COUNT}`,
    { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'vllm-agent-docs-changelog-generator' } },
  )
  if (!res.ok) {
    throw new Error(`GitHub API request failed: ${res.status} ${res.statusText}`)
  }
  const releases = (await res.json()) as Array<GithubRelease>

  const entries = releases
    .map((release) => {
      const highlights = extractHighlights(release.body)
      const bullets = highlights.length
        ? highlights.map((h) => `- ${h}`).join('\n')
        : '- See the full release notes for what changed.'
      return `## ${release.tag_name} — ${formatDate(release.published_at)}\n\n${bullets}\n\n[Full release notes on GitHub](${release.html_url})`
    })
    .join('\n\n')

  const content = `---
title: Changelog
description: What changed in vLLM releases, generated from vllm-project/vllm's GitHub releases.
---

<Note type="info" title="Generated page">
  Entries below are generated from [vLLM's GitHub releases](https://github.com/${REPO}/releases)
  by \`scripts/generate-changelog.mts\`, not hand-written. Re-run
  \`npm run changelog:build\` to refresh. This mirrors the release notes vLLM
  publishes for its own project — this site's own changes aren't tracked here.
</Note>

${entries}
`

  await writeFile(OUTPUT_PATH, content, 'utf8')
  console.log(`Wrote ${releases.length} releases to ${OUTPUT_PATH}`)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
