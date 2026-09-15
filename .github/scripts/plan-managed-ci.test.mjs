/** Tests for the generated managed-site CI impact planner. */

import assert from "node:assert/strict";
import test from "node:test";

import { createManagedCiPlan } from "./plan-managed-ci.mjs";

test("content and navigation changes use the lightweight gate", () => {
  assert.deepEqual(
    createManagedCiPlan([
      "src/content/guides/quickstart.mdx",
      "docs.json",
      "public/logo.svg",
    ]),
    { changedCount: 3, full: false, mode: "content" },
  );
});

test("runtime and dependency changes retain the full gate", () => {
  for (const path of [
    "src/components/docs/doc-layout.tsx",
    "src/data/site.ts",
    "package-lock.json",
    ".github/workflows/ci.yml",
  ]) {
    assert.equal(createManagedCiPlan([path]).full, true, path);
  }
});

test("manual or ambiguous validation retains the full gate", () => {
  assert.equal(createManagedCiPlan([]).full, true);
});
