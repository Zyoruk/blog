---
name: edit-review
description: Editorial review of a blog post draft, preserving the author's voice, then run the checks and prepare the PR for merge. Use when the author says "review my post", "edit-review", "editorial pass", or passes a post PR number or file.
argument-hint: "[PR number | post path]"
---

# Editorial review

Goal: make the author's post clearer and correct without making it sound like someone else wrote it. Follow `CLAUDE.md`, especially "The author's voice".

## 1. Load the post

- **PR number:** `gh pr view <n>` and `gh pr checkout <n>`. Find the changed file under `src/content/`.
- **Path:** read it; if it's on a `post/*` branch with a PR, find the PR with `gh pr view`.
- **Nothing:** use the post changed on the current branch versus `main`.

Read the linked issue (brainstorm notes), and two existing posts to re-tune to the voice.

## 2. Review in two layers

**Fix directly** (no need to ask), as one commit, "Copyedit: <slug>":

- Spelling, grammar, punctuation, article and preposition errors, wrong idioms.
- Broken Markdown, heading levels (`###` for sections), list formatting.
- Frontmatter matching the schema and the `CLAUDE.md` rules.

Keep the author's sentence when it's correct, even if you'd phrase it differently.

**Suggest, don't apply** (the author decides):

- Structure: a buried lead, a section that belongs elsewhere or can go, a missing conclusion.
- Argument: claims without an example, places a reader will ask "why?" or "like what?".
- Clarity: sentences that are hard to follow. Offer one rewrite in the author's voice.
- Title and `description`: is it specific? Would it make you click?
- Length: does an essay want to be a note, or a note an essay?

Give suggestions in chat as a short numbered list, most important first, each with the quote it's about. Don't pad it with praise; one line on what works is enough. Apply only the ones the author picks.

## 3. Finish

When the author is happy:

1. Set `pubDate` to today (the expected merge day) and decide `status` with the author.
2. Make sure there's no `hidden: true` unless the author wants to merge it unfinished.
3. Run `yarn run check` and `yarn build`; fix anything they report.
4. Commit, push, `gh pr ready <n>`. Give the author the PR URL and the Amplify preview link from the PR. Don't merge.
