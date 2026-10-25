#!/usr/bin/env node
// Checks that every cited source is real and says what the post claims.
// For each entry it fetches the URL and, when the entry has a `quote`, checks
// that the quote appears in the page text (whitespace and case ignored).
//
// Input: either a JSON file with an array of { "title", "url", "quote"? } (the
// contract the /research skill writes to .private/<slug>/sources.json), or a post
// whose frontmatter has a `sources:` list in the shape of .github/guide-template.md.
//
// Usage:
//   node scripts/verify-sources.mjs <sources.json | post.md> [--json] [--timeout 15000]
//
// Exit 1 when any source fails. Failures are shown to the author, who decides
// what to do with them. Nothing is rewritten automatically.

import { readFileSync } from "node:fs";
import { extname } from "node:path";

const args = process.argv.slice(2);
const timeoutIdx = args.indexOf("--timeout");
const TIMEOUT = timeoutIdx > -1 ? Number(args[timeoutIdx + 1]) : 15000;
const timeoutValueIdx = timeoutIdx > -1 ? timeoutIdx + 1 : -1;
const file = args.find((a, i) => !a.startsWith("--") && i !== timeoutValueIdx);
const asJson = args.includes("--json");

if (!file) {
	console.error("usage: node scripts/verify-sources.mjs <sources.json> [--json] [--timeout ms]");
	process.exit(2);
}

// Reads the `sources:` block of a post's frontmatter. It only understands the
// shape the templates use (a list of mappings, quoted or bare scalars) and fails
// loudly on anything else, rather than silently skipping a source.
function sourcesFromFrontmatter(text) {
	const lines = text.split("\n");
	if (lines[0]?.trim() !== "---") return [];
	const end = lines.indexOf("---", 1);
	const block = lines.slice(1, end === -1 ? undefined : end);
	const start = block.findIndex((l) => /^sources:\s*$/.test(l));
	if (start === -1) return [];
	const out = [];
	let current = null;
	for (const raw of block.slice(start + 1)) {
		if (raw.trim() === "" || raw.trim().startsWith("#")) continue;
		if (!/^\s/.test(raw)) break; // next top-level key
		const item = raw.match(/^\s*-\s+(\w+):\s*(.*)$/);
		const field = raw.match(/^\s+(\w+):\s*(.*)$/);
		if (item) {
			current = {};
			out.push(current);
			current[item[1]] = unquote(item[2]);
		} else if (field && current) {
			current[field[1]] = unquote(field[2]);
		} else {
			throw new Error(`unsupported line in sources frontmatter: ${raw.trim()}`);
		}
	}
	return out.filter((s) => s.url);
}

const unquote = (v) => v.trim().replace(/^(['"])(.*)\1$/, "$2");

const entries =
	extname(file) === ".json"
		? JSON.parse(readFileSync(file, "utf8"))
		: sourcesFromFrontmatter(readFileSync(file, "utf8"));
if (extname(file) !== ".json" && entries.length === 0) {
	console.error(`${file}: no sources in frontmatter, nothing to verify`);
	process.exit(0);
}
if (!Array.isArray(entries)) {
	console.error(`${file}: expected a JSON array of sources`);
	process.exit(2);
}

// Collapse tags and whitespace, lowercase, and drop the usual typographic quotes,
// so a quote copied from a rendered page still matches the HTML source.
const normalize = (s) =>
	s
		.replace(/<script[\s\S]*?<\/script>/gi, " ")
		.replace(/<style[\s\S]*?<\/style>/gi, " ")
		.replace(/<[^>]+>/g, " ")
		.replace(/&nbsp;/g, " ")
		.replace(/&amp;/g, "&")
		.replace(/&quot;|&#39;|&rsquo;|&lsquo;|&rdquo;|&ldquo;|[“”‘’"']/g, "'")
		.replace(/\s+/g, " ")
		.trim()
		.toLowerCase();

async function check(entry) {
	const result = { title: entry.title, url: entry.url, ok: false, status: null, reason: "" };
	try {
		new URL(entry.url);
	} catch {
		return { ...result, reason: "invalid URL" };
	}
	try {
		const res = await fetch(entry.url, {
			redirect: "follow",
			signal: AbortSignal.timeout(TIMEOUT),
			headers: { "user-agent": "blog-source-verifier/1.0 (+https://blog.devpand.com)" },
		});
		result.status = res.status;
		if (!res.ok) return { ...result, reason: `HTTP ${res.status}` };
		if (entry.quote) {
			const body = normalize(await res.text());
			if (!body.includes(normalize(entry.quote))) {
				return { ...result, reason: "quote not found on the page" };
			}
		}
		return { ...result, ok: true, reason: entry.quote ? "quote found" : "reachable" };
	} catch (err) {
		return { ...result, reason: err.name === "TimeoutError" ? "timed out" : `fetch failed: ${err.cause?.code ?? err.message}` };
	}
}

const results = [];
for (const entry of entries) results.push(await check(entry));

if (asJson) {
	console.log(JSON.stringify(results, null, 2));
} else {
	for (const r of results) {
		console.log(`${r.ok ? "ok  " : "FAIL"}  ${r.url}`);
		console.log(`      ${r.title}: ${r.reason}`);
	}
}

const failed = results.filter((r) => !r.ok).length;
if (failed) {
	console.error(`\nverify-sources: ${failed} of ${results.length} source(s) failed.`);
	process.exit(1);
}
console.error(`verify-sources: all ${results.length} source(s) verified.`);
