#!/usr/bin/env node
// Scans content for anything that shouldn't leave the author's machine before
// it is public-ready: terms from the local denylist (client, employer and
// colleague names, internal project names) plus a few patterns that are never
// fine to publish (emails, cloud keys, account ids, private IPs).
//
// Usage:
//   node scripts/check-pi.mjs [files or folders...]   (default: src/content)
//
// The denylist lives in .private/denylist.txt, one term per line, `#` for
// comments. It is gitignored on purpose: the list itself is sensitive.
//
// Exit code 1 when anything matches. A hit is not a verdict: the author decides
// whether each one is public or approved. Claude never decides it.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const DENYLIST = ".private/denylist.txt";
const TEXT = new Set([".md", ".mdx", ".yml", ".yaml", ".json", ".txt", ".astro", ".ts", ".js", ".mjs"]);

const PATTERNS = [
	{ label: "email address", re: /[\w.+-]+@[\w-]+(\.[\w-]+)+/g },
	{ label: "AWS access key", re: /\b(AKIA|ASIA)[A-Z0-9]{16}\b/g },
	{ label: "AWS account id", re: /\b\d{12}\b/g },
	{ label: "private IP", re: /\b(10|192\.168|172\.(1[6-9]|2\d|3[01]))(\.\d{1,3}){2,3}\b/g },
	{ label: "secret-looking token", re: /\b(ghp|gho|github_pat|sk|xox[abp])[_-][A-Za-z0-9_-]{16,}\b/g },
];

// Example addresses in templates and docs are fine.
const ALLOWED = [/@example\.(com|org)\b/i, /noreply@/i];

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function loadDenylist() {
	if (!existsSync(DENYLIST)) return null;
	return readFileSync(DENYLIST, "utf8")
		.split("\n")
		.map((line) => line.replace(/#.*/, "").trim())
		.filter(Boolean)
		.map((term) => ({
			label: `denylist: ${term}`,
			// Whole words, case-insensitive, so "Acme" catches "ACME" but not "acmeist".
			re: new RegExp(`(?<![\\p{L}\\p{N}])${escape(term)}(?![\\p{L}\\p{N}])`, "giu"),
		}));
}

function collect(path, out) {
	if (!existsSync(path)) return out;
	const stat = statSync(path);
	if (stat.isDirectory()) {
		for (const name of readdirSync(path)) {
			if (name === "node_modules" || name === ".git") continue;
			collect(join(path, name), out);
		}
	} else if (TEXT.has(extname(path))) {
		out.push(path);
	}
	return out;
}

const targets = process.argv.slice(2);
const files = (targets.length ? targets : ["src/content"]).flatMap((t) => collect(t, []));
const denylist = loadDenylist();
const rules = [...(denylist ?? []), ...PATTERNS];

if (!denylist) {
	console.warn(
		`check:pi: no ${DENYLIST} found, so only the built-in patterns ran.\n` +
			"  Add client, employer, colleague and internal project names there, one per line.\n"
	);
}

let hits = 0;
for (const file of files) {
	const lines = readFileSync(file, "utf8").split("\n");
	lines.forEach((line, i) => {
		for (const { label, re } of rules) {
			for (const match of line.matchAll(re)) {
				if (ALLOWED.some((ok) => ok.test(match[0]))) continue;
				hits++;
				console.log(`${relative(".", file)}:${i + 1}  ${label}  "${match[0]}"`);
				console.log(`    ${line.trim().slice(0, 140)}`);
			}
		}
	});
}

if (hits) {
	console.log(`\ncheck:pi: ${hits} hit(s) in ${files.length} file(s). Review each one before publishing.`);
	process.exit(1);
}
console.log(`check:pi: no hits in ${files.length} file(s).`);
