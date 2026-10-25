---
name: brainstorm
description: Brainstorm a blog post with the author, from a blank page, an issue, or an existing draft, and end with an angle and outline saved locally in .private/<slug>/. Use when the author says "brainstorm", "I have an idea for a post", "help me shape this draft", or passes an issue number or draft file.
argument-hint: "[issue number | draft path | topic]"
---

# Brainstorm a post

Goal: help the author find what they actually want to say. You are a thinking partner, not a ghostwriter. Follow `CLAUDE.md` ("Who writes what", "Private until public-ready", "The author's voice").

Everything in a brainstorm is private until the author declares it public-ready. Nothing from it goes to GitHub: no issue, comment, branch or commit.

## 1. Find the starting point

From `$ARGUMENTS`:

- **Issue number:** `gh issue view <n> --comments`.
- **Slug with a `.private/<slug>/` folder:** read what's there and continue.
- **Draft path, or a `post/*` branch:** read the draft fully.
- **Topic or nothing:** start from scratch.

Skim `src/content/blog/` and `src/content/notes/` titles and tags so you know what the author has already written. Point out overlaps and natural links to earlier posts.

## 2. Talk it through

Ask one question at a time and wait for the answer. Don't send a questionnaire. Useful questions, in roughly this order, skipping what's already clear:

- What happened that made you want to write this? (The real story is usually the post.)
- Who is it for, and what should they do or think differently after reading?
- What's the one claim you'd defend in an argument?
- What's the example or experience that proves it? (Ask; never invent one.)
- What type is it? An **essay** argues an opinion from experience; a **note** fits in a few paragraphs; a **guide** explains a topic and needs sources; a **case study** walks through one real piece of work. If it's a case study, who and what can be named in public?

Push back when the idea is vague, too broad, or already covered by an existing post. Offer two or three possible angles when the author is stuck, and let them pick.

From a draft: say what the draft is really about (it's often not the title), what's strongest, and what's missing. Don't rewrite it.

## 3. Write down the result

Produce, in chat, and get the author's OK:

- Working title, one-sentence `description`, type (essay, note, guide or case study), tags (reuse existing ones).
- The angle in one or two sentences.
- An outline: section headings with a bullet or two each, in the author's terms. Mark gaps as questions for the author ("Your example of X here?").

Then, with the author's OK, save it locally:

1. Write it to `.private/<slug>/brainstorm.md`.
2. If the author wants to start writing now: copy the template for the type (see "File" in `CLAUDE.md`) to `.private/<slug>/<slug>.md`, fill the frontmatter, and put the outline in as `###` headings with `<!-- -->` comments for the gaps. Don't commit anything.
3. Tell the author where the files are, and that `/publish-ready <slug>` is the step that takes it public when they decide it's ready.
