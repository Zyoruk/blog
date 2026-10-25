#!/usr/bin/env node
// Deterministic anti-slop check for post prose. Reads the banned phrases in
// scripts/prose-banned.txt and flags paragraphs with too many em dashes.
// Frontmatter and fenced code are skipped. No model is involved, so the same
// draft always gets the same result.
//
// Usage:
//   node scripts/lint-prose.mjs [files...]    (default: src/content/**/*.md[x])
//
// Exit 1 when anything is flagged. A flag is a question for the author, not an
// automatic rewrite: the author keeps the last word.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const MAX_DASHES_PER_PARAGRAPH = 2;

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const banned = readFileSync(join(here, "prose-banned.txt"), "utf8")
	.split("\n")
	.map((line) => line.trim())
	.filter((line) => line && !line.startsWith("#"))
	.map((phrase) => ({
		phrase,
		re: new RegExp(`(?<![\\p{L}\\p{N}])${escape(phrase)}(?![\\p{L}\\p{N}])`, "giu"),
	}));

function collect(path, out) {
	if (statSync(path).isDirectory()) {
		for (const name of readdirSync(path)) collect(join(path, name), out);
	} else if ([".md", ".mdx"].includes(extname(path))) {
		out.push(path);
	}
	return out;
}

// Yields [lineNumber, text] for prose lines only.
function* proseLines(source) {
	const lines = source.split("\n");
	let i = 0;
	if (lines[0]?.trim() === "---") {
		i = 1;
		while (i < lines.length && lines[i].trim() !== "---") i++;
		i++;
	}
	let fenced = false;
	for (; i < lines.length; i++) {
		if (/^\s*(```|~~~)/.test(lines[i])) {
			fenced = !fenced;
			continue;
		}
		if (!fenced) yield [i + 1, lines[i]];
	}
}

const args = process.argv.slice(2);
const root = resolve(".");
const files = (args.length ? args : ["src/content"]).flatMap((p) => collect(resolve(p), []));

let flags = 0;
for (const file of files) {
	const name = relative(root, file);
	const source = readFileSync(file, "utf8");

	for (const [lineNo, text] of proseLines(source)) {
		for (const { phrase, re } of banned) {
			for (const match of text.matchAll(re)) {
				flags++;
				console.log(`${name}:${lineNo}  banned phrase "${phrase}"`);
				console.log(`    ${text.trim().slice(0, 140)}`);
			}
		}
	}

	// Em dashes are checked per paragraph: blank lines separate paragraphs.
	let paragraph = [];
	const flushParagraph = () => {
		if (!paragraph.length) return;
		const text = paragraph.map(([, t]) => t).join(" ");
		const dashes = (text.match(/—/g) ?? []).length;
		if (dashes > MAX_DASHES_PER_PARAGRAPH) {
			flags++;
			console.log(`${name}:${paragraph[0][0]}  ${dashes} em dashes in one paragraph`);
			console.log(`    ${text.trim().slice(0, 140)}`);
		}
		paragraph = [];
	};
	for (const entry of proseLines(source)) {
		if (entry[1].trim() === "") flushParagraph();
		else paragraph.push(entry);
	}
	flushParagraph();
}

if (flags) {
	console.log(`\nlint:prose: ${flags} flag(s) in ${files.length} file(s). Each one is a question for the author.`);
	process.exit(1);
}
console.log(`lint:prose: no flags in ${files.length} file(s).`);
