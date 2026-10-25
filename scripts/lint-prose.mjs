#!/usr/bin/env node
// Deterministic anti-slop check for post prose. Three kinds of rule, no model:
//
//   1. Banned phrases, one per line in scripts/prose-banned.txt.
//   2. Structural tells: contrast bridges ("not only X but Y", "it's not X, it's Y"),
//      "Key takeaways" headers, symbol-bullet runs, hook openers, emojis,
//      calls to engage ("link in the comments"), and a closing question to readers.
//   3. Em dash density: more than two per paragraph.
//
// Frontmatter and fenced code are skipped. Each flag is a question for the
// author, not an automatic rewrite: the author keeps the last word.
//
// Usage:
//   node scripts/lint-prose.mjs [files or folders...]   (default: src/content)

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
export const MAX_DASHES_PER_PARAGRAPH = 2;

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Symbols that sit at the start of a line in LinkedIn-style lists.
const SYMBOL_BULLET = /^\s*(?:[•▪◦●■]|[\p{Extended_Pictographic}]️?)\s/u;
const EMOJI = /\p{Extended_Pictographic}/u;

// Each rule gets a whole paragraph (lines joined with spaces) unless `line` is set.
export const RULES = [
	{
		label: "contrast bridge",
		re: /\bnot (?:only|just|merely|simply) [^.!?]{1,90}?,? but (?:also )?/i,
	},
	{
		label: "contrast bridge",
		re: /\b(?:it's|it is|this is|that's|that is|it isn't|it is not) (?:not|never) (?:about |just |merely |really )?[^.!?]{1,90}?,? (?:it's|it is|this is|that's|that is|it's really|it is really) /i,
	},
	{
		label: "header-style summary",
		re: /(?:^|\s)(?:\*\*|#+\s*)?(?:key (?:takeaways?|insights?|lessons?|learnings?|points?|highlights?)|the bottom line|the takeaway|the big picture|tl;?dr)\b/i,
		line: true,
	},
	{
		label: "one-word hook",
		re: /^\s*(?:two|one|three|four|five) words?:/i,
		line: true,
	},
	{
		label: "symbol bullet",
		test: (line) => SYMBOL_BULLET.test(line),
		line: true,
	},
	{
		label: "emoji in prose",
		test: (line) => EMOJI.test(line),
		line: true,
	},
	{
		label: "call to engage",
		re: /\b(?:tag (?:them|someone|a (?:friend|colleague))|link in (?:the )?(?:first )?comments?|swipe (?:through|left)|drop a (?:comment|link)|let me know (?:in|below)|comment below|share below|thoughts\?)/i,
	},
];

// A closing question addressed to readers ("Are you...?", "Which ... are you...?").
export const CLOSING_QUESTION = /\b(?:are you|which .{0,60}\bare you|what(?:'s| is| has been) your|do you agree|what do you think)\b[^?]*\?/i;

function loadBanned() {
	return readFileSync(join(here, "prose-banned.txt"), "utf8")
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line && !line.startsWith("#"))
		.map((phrase) => ({
			label: `banned phrase "${phrase}"`,
			re: new RegExp(`(?<![\\p{L}\\p{N}])${escape(phrase)}(?![\\p{L}\\p{N}])`, "giu"),
		}));
}

// Returns [{ start, text }] for prose paragraphs: frontmatter and code skipped,
// blank lines separate paragraphs. `start` is the first line of the paragraph.
export function paragraphs(source) {
	const lines = source.split("\n");
	let i = 0;
	if (lines[0]?.trim() === "---") {
		i = 1;
		while (i < lines.length && lines[i].trim() !== "---") i++;
		i++;
	}
	const out = [];
	let current = null;
	let fenced = false;
	for (; i < lines.length; i++) {
		const line = lines[i];
		if (/^\s*(```|~~~)/.test(line)) {
			fenced = !fenced;
			continue;
		}
		if (fenced) continue;
		if (line.trim() === "") {
			current = null;
			continue;
		}
		if (!current) {
			current = { start: i + 1, lines: [] };
			out.push(current);
		}
		current.lines.push(line);
	}
	return out.map((p) => ({ start: p.start, lines: p.lines, text: p.lines.join(" ") }));
}

export function lintSource(source, banned = loadBanned()) {
	const flags = [];
	const paras = paragraphs(source);

	for (const para of paras) {
		// Line-level rules first, so each line is reported at its own number.
		para.lines.forEach((line, idx) => {
			for (const rule of RULES.filter((r) => r.line)) {
				const hit = rule.test ? rule.test(line) : rule.re.test(line);
				if (hit) flags.push({ line: para.start + idx, label: rule.label, text: line });
			}
		});

		// Paragraph-level rules: a bridge can run across a line break.
		for (const rule of RULES.filter((r) => !r.line && r.re)) {
			const m = para.text.match(rule.re);
			if (m) flags.push({ line: para.start, label: rule.label, text: para.text, match: m[0] });
		}
		for (const { label, re } of banned) {
			for (const m of para.text.matchAll(re)) {
				flags.push({ line: para.start, label, text: para.text, match: m[0] });
			}
		}

		const dashes = (para.text.match(/—/g) ?? []).length;
		if (dashes > MAX_DASHES_PER_PARAGRAPH) {
			flags.push({ line: para.start, label: `${dashes} em dashes in one paragraph`, text: para.text });
		}
	}

	// Closing question: only the last paragraph of the body counts.
	const last = paras.at(-1);
	if (last && CLOSING_QUESTION.test(last.text)) {
		flags.push({ line: last.start, label: "closing question to readers", text: last.text });
	}

	return flags;
}

function collect(path, out) {
	if (statSync(path).isDirectory()) {
		for (const name of readdirSync(path)) collect(join(path, name), out);
	} else if ([".md", ".mdx"].includes(extname(path))) {
		out.push(path);
	}
	return out;
}

// Runs only when executed directly, so the tests can import the rules.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const args = process.argv.slice(2);
	const root = resolve(".");
	const files = (args.length ? args : ["src/content"]).flatMap((p) => collect(resolve(p), []));
	const banned = loadBanned();

	let total = 0;
	for (const file of files) {
		const name = relative(root, file);
		for (const flag of lintSource(readFileSync(file, "utf8"), banned)) {
			total++;
			const detail = flag.match ? ` "${flag.match}"` : "";
			console.log(`${name}:${flag.line}  ${flag.label}${detail}`);
			console.log(`    ${flag.text.trim().slice(0, 140)}`);
		}
	}

	if (total) {
		console.log(`\nlint:prose: ${total} flag(s) in ${files.length} file(s). Each one is a question for the author.`);
		process.exit(1);
	}
	console.log(`lint:prose: no flags in ${files.length} file(s).`);
}
