---
name: draft
description: Assemble a draft in .private/<slug>/<slug>.md from the author's own interview answers and the verified sources, under the outline and template for the post's type, with a provenance comment on every paragraph and gaps left as questions. Use when the author says "draft it", "put it together", "make a first draft from my notes", or once /interview and /research are done.
argument-hint: "<slug>"
---

# Assemble a draft

Goal: put the author's own sentences in order, under the right headings, so they can rewrite them. You don't write new prose. Follow `CLAUDE.md`, especially "Who writes what" and "Never invent".

A good draft from this skill is mostly the author's words, moved and cut, with a few questions where something is missing. A draft full of smooth sentences from you is the failure this skill exists to prevent.

## 1. Load the inputs

Read:

- `.private/<slug>/brainstorm.md` for the angle and outline
- `.private/<slug>/interview.md` for the author's answers and their tags
- `.private/<slug>/research.md` and `sources.json` for the verified sources
- the template for the post's type: `.github/post-template.md` (essay or note), `.github/guide-template.md` (guide) or `.github/case-template.md` (case study)

If the outline is missing, ask the author for one before drafting. Don't invent headings.

## 2. Map the material to the outline

For each outline heading, pick the answers and sources that belong there. Keep a list of what's left over; don't force it in.

## 3. Write the draft

Create `.private/<slug>/<slug>.md` from the template. Fill the frontmatter from the brainstorm (the description and tags the author approved). Then, under each heading:

- Put the author's answer in, cleaned up only where needed: fix grammar and spelling, cut filler, keep their phrasing and word choices. Don't merge two answers into a sentence they didn't say.
- Put a provenance comment above each paragraph, for example `<!-- from: interview Q4 -->`.
- For a claim that comes from a source, cite it with a footnote (`[^1]`) and add a `<!-- from: sources s1 -->` comment. Add the footnote definitions at the bottom, copied from `sources.json`.
- Where the outline needs something nobody said, leave `<!-- gap: ask author: <the question> -->` and the question. Don't fill it.

Don't write transitions, intros, conclusions or summaries. If the piece needs one, the author writes it, or the gap is flagged for them.

## 4. Check it

Run:

```sh
yarn lint:prose .private/<slug>/<slug>.md
```

Fix the flags that are about your own wording. For flags in the author's sentences, show them and let the author decide. Then list for the author: the number of gaps, the headings with no material, and the leftover answers that didn't fit.

## 5. Hand it back

Tell the author where the draft is and that it's theirs to rewrite. Don't offer to write the missing parts. Offer to ask the questions in the gaps, one at a time, with `/interview`.

The provenance comments and gap markers are removed by `/publish-ready` before anything goes public. Gaps must be resolved before that.
