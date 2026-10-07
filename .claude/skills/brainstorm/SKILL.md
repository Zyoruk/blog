---
name: brainstorm
description: Brainstorm a blog post with the author, from a blank page, an issue, or an existing draft, and end with an angle and outline on a post issue and branch. Use when the author says "brainstorm", "I have an idea for a post", "help me shape this draft", or passes an issue number or draft file.
argument-hint: "[issue number | draft path | topic]"
---

# Brainstorm a post

Goal: help the author find what they actually want to say. You are a thinking partner, not a ghostwriter. Follow `CLAUDE.md` ("Who writes what", "The author's voice").

## 1. Find the starting point

From `$ARGUMENTS`:

- **Issue number:** `gh issue view <n> --comments`.
- **Draft path, or a `post/*` branch:** read the draft fully.
- **Topic or nothing:** start from scratch.

Skim `src/content/blog/` and `src/content/notes/` titles and tags so you know what the author has already written. Point out overlaps and natural links to earlier posts.

## 2. Talk it through

Ask one question at a time and wait for the answer. Don't send a questionnaire. Useful questions, in roughly this order, skipping what's already clear:

- What happened that made you want to write this? (The real story is usually the post.)
- Who is it for, and what should they do or think differently after reading?
- What's the one claim you'd defend in an argument?
- What's the example or experience that proves it? (Ask; never invent one.)
- Essay or note? A note is fine if the idea fits in a few paragraphs.

Push back when the idea is vague, too broad, or already covered by an existing post. Offer two or three possible angles when the author is stuck, and let them pick.

From a draft: say what the draft is really about (it's often not the title), what's strongest, and what's missing. Don't rewrite it.

## 3. Write down the result

Produce, in chat, and get the author's OK:

- Working title, one-sentence `description`, essay or note, tags (reuse existing ones).
- The angle in one or two sentences.
- An outline: section headings with a bullet or two each, in the author's terms. Mark gaps as questions for the author ("Your example of X here?").

Then, with the author's OK:

1. Post it on the issue as a comment (create the issue with `gh issue create --label post --title "Post: <title>"` if there isn't one).
2. If the author wants to start writing now: branch `post/<slug>` off `main`, copy `.github/post-template.md` to the right folder, fill the frontmatter, put the outline in as `<!-- -->` comments or `###` headings, commit, push, and open the draft PR as described in `CLAUDE.md`. Report the PR URL.
