---
name: publish-ready
description: Take a local post in .private/<slug>/ public, once the author declares it public-ready. Scans for private information, walks the author through every finding, then opens the issue, branch and draft PR. Use when the author says "publish-ready", "make it public", "open the PR for my draft", or passes a slug.
argument-hint: "<slug>"
---

# Public-ready gate

Goal: nothing private leaves the author's machine. This is the only step that moves a post from `.private/` to GitHub. Follow `CLAUDE.md`, especially "Private until public-ready".

The author decides what is public-ready. You find things and ask; you never declare a post ready yourself, and you never skip a finding because it looks harmless.

## 1. Load the local work

From `$ARGUMENTS`, read `.private/<slug>/<slug>.md` (the draft) and `.private/<slug>/brainstorm.md` if present. If there's no draft, stop and say so. Check the draft's type against its frontmatter (guides need `sources`, case studies need `role` and `period`).

If `.private/denylist.txt` doesn't exist, tell the author the scan will only run the built-in patterns and offer to help them write the list (client, employer, colleague and internal project names, one per line). The list stays local.

## 2. Scan

1. Run `yarn check:pi .private/<slug>/<slug>.md`.
2. Read the draft yourself for what a list can't catch: identifying details (a client's industry plus city plus year), internal numbers (costs, headcount, revenue, incident counts), quotes from colleagues or chats, screenshots, links to internal tools or private repos, and anything the author marked as private in the brainstorm.

## 3. Clear the drafting markers

1. Stop if the draft has any `<!-- gap: ... -->` marker. Each one is a question the author has to answer, or a paragraph they have to cut. Don't publish with gaps open.
2. Remove every `<!-- from: ... -->` comment. They're for the author's review, not for readers, and they name the private sources.
3. Confirm the frontmatter has no leftover placeholder text from the template.

## 4. Walk the author through it

Show every finding as a short numbered list: the quote, why it might be private, and a suggested neutral rewrite ("a fintech client" instead of the name). One list, most sensitive first. Then ask the author to decide on each: keep (it's public or approved), rewrite, or cut. Apply only what they choose, in the local draft.

Repeat the scan after the changes. When it's clean, or every remaining hit is one the author kept on purpose, ask plainly: "Is this public-ready?" Continue only on a clear yes.

Also run `yarn verify:sources` on the post so the cited URLs are checked before the PR.

## 5. Take it public

Only the post goes out. Never copy the brainstorm, interview notes or any other `.private/` file into GitHub.

1. Draft the issue: title `Post: <title>`, the type, the pitch (the post's `description`) and tags. Show the author the exact text and wait for their OK; the issue is public.
2. `gh issue create --label post --title "Post: <title>" --body <approved text>`.
3. Branch `post/<slug>` off an up-to-date `main`. Copy the draft to its folder by type (see "File" in `CLAUDE.md`). If the draft is unfinished, ask whether to add `hidden: true`.
4. `yarn run check`, then commit (`Post: <title>`) and push. The pre-commit hook scans again; if it stops the commit, show the author the hits and don't use `--no-verify` unless they say so.
5. `gh pr create --draft` as described in `CLAUDE.md`, with `Closes #<issue>` and the one-line pitch.
6. Report the issue and PR URLs. From here, `/edit-review` takes over.

Leave `.private/<slug>/` in place; the author deletes it when they're done.
