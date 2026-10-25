// Run with: node --test scripts/
// The fixtures are synthetic. They show each tell and a plain-writing control,
// without copying third-party posts into this repository.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { lintSource } from "./lint-prose.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const load = (name) => readFileSync(join(here, "fixtures", name), "utf8");
const labels = (flags) => flags.map((f) => f.label);

test("linkedin-style fixture trips every structural rule", () => {
	const flags = labels(lintSource(load("linkedin-style.md")));
	for (const expected of [
		"contrast bridge",
		"header-style summary",
		"symbol bullet",
		"one-word hook",
		"emoji in prose",
		"call to engage",
		"closing question to readers",
		"banned phrase \"quietly\"",
		"banned phrase \"game changer\"",
	]) {
		assert.ok(flags.includes(expected), `expected a flag for: ${expected}\ngot: ${flags.join(", ")}`);
	}
});

test("plain writing passes", () => {
	const flags = lintSource(load("human-style.md"));
	assert.deepEqual(labels(flags), [], JSON.stringify(flags, null, 2));
});

test("markdown lists with bold keys are not flagged as symbol bullets", () => {
	const flags = labels(lintSource(load("human-style.md")));
	assert.ok(!flags.includes("symbol bullet"));
});

test("frontmatter and fenced code are skipped", () => {
	const src = "---\ntitle: 'delve'\n---\n\n```\nwe will delve in\n```\n\nPlain sentence.\n";
	assert.deepEqual(labels(lintSource(src)), []);
});

test("em dashes are checked per paragraph", () => {
	const src = "A—B—C—D in one paragraph.\n\nE—F ok.\n";
	assert.deepEqual(labels(lintSource(src)), ["3 em dashes in one paragraph"]);
});
