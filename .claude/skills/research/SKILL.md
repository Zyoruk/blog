---
name: research
description: Find published sources for the claims a post makes that come from outside the author's experience, record them in .private/<slug>/sources.json with exact quotes, and verify each one with scripts/verify-sources.mjs. Use when the author says "research this", "find sources", "back this up", or after /interview has tagged claims that need outside support.
argument-hint: "<slug>"
---

# Research and cite

Goal: every claim that isn't the author's own experience points to a source that exists, loads, and says what the post says it says. Follow `CLAUDE.md`, especially "Frontmatter" (`sources`) and "Never invent".

Nothing here is written for the reader. You produce notes and a source list. The author writes the post.

## 1. Find out what needs a source

Read `.private/<slug>/interview.md` and `brainstorm.md`. Take the `[claim]` and `[number]` tags that aren't the author's own experience. Each becomes a research question. List them for the author before searching, and drop any the author says they don't want to back.

## 2. Search

Use web search and the sources the author prefers: papers (arXiv, ACM, IEEE, OpenAlex or Semantic Scholar), official documentation, vendor engineering blogs, and well-known journalism. Prefer primary sources over summaries of them. Note the date of each one. Skip content farms, AI-written pages and sources you can't open.

## 3. Record each source

Write `.private/<slug>/sources.json` as an array. Each entry has:

```json
{
  "id": "s1",
  "title": "Exact title of the page or paper",
  "url": "https://...",
  "author": "Name, if the page gives one",
  "publisher": "Site or journal",
  "date": "2025-03-01",
  "quote": "A sentence copied exactly from the page that supports the claim",
  "supports": ["interview Q4", "claim: ..."]
}
```

Copy `quote` from the page text. Never paraphrase it into `quote`, never reconstruct it from memory, and never invent one. If you can't find an exact sentence that supports the claim, the claim is not supported: record it as a gap.

## 4. Verify

Run:

```sh
yarn verify:sources .private/<slug>/sources.json
```

It fetches every URL and checks that each quote appears on its page. For each failure, either fix the entry (a better URL, or the quote as it really reads) or drop the source and record the claim as a gap. Don't keep a failing source because it's close.

## 5. Write the research notes

Write `.private/<slug>/research.md`: one section per claim, listing the source ids that back it, plus a `Gaps` section with every claim left without a verified source and what would be needed to back it. Keep it short. It's for the author's decisions, not for the post.

Finish by telling the author: how many sources verified, which claims are gaps, and which of them they might want to cut or rephrase as their own opinion.
