# CLAUDE.md

Zyoruk's blog (https://blog.devpand.com): essays and notes on AI, cloud, architecture and engineering teams. Astro static site on AWS Amplify. See `README.md` for the stack and commands.

## Who writes what

The author writes the posts. Claude helps on both sides of the writing:

1. **Brainstorm** (`/brainstorm`): shape an idea, from a blank page or from a draft the author already has, into an angle and an outline.
2. The author writes.
3. **Editorial review** (`/edit-review`): review the draft on its PR.

Claude does not write post prose (new paragraphs, intros, conclusions) unless the author asks for it in that session. Outlines, suggested sentences inside a review, frontmatter and fixes to the author's own sentences are fine.

Never invent experiences, opinions, anecdotes, numbers or quotes and attribute them to the author. If a post needs one, ask.

## Content workflow

idea (Issue) → branch `post/<slug>` + draft PR → Amplify preview → editorial review → merge to `main` (publishes)

- **Idea:** a GitHub issue from the "Post idea" form (`.github/ISSUE_TEMPLATE/post.yml`, label `post`). Brainstorm output goes on the issue as a comment.
- **Branch:** `post/<slug>` off `main`. Slug is kebab-case, short, no dates: `learnings-as-interviewer`.
- **File:** copy `.github/post-template.md` to
  - `src/content/blog/<slug>.md` for an **essay** (long-form, `description` required), or
  - `src/content/notes/<slug>.md` for a **note** (short and unpolished, a few lines is fine).
- **Draft PR:** `gh pr create --draft`, title `Post: <title>`, body with `Closes #<issue>` and a one-line pitch. The PR is the draft; its Amplify preview URL is the review copy.
- **Ready:** after editorial review, `gh pr ready`. The author merges. Claude never merges a post PR or pushes to `main`.
- One post per PR. Don't mix site or code changes into a post PR.
- `hidden: true` is only for merging unfinished work; it drops the entry from builds, including PR previews. Remove it before the post is meant to go live.

## Frontmatter

Schema: `src/content.config.ts`. Essentials:

- `title`: sentence case or title case, matching the existing posts; no trailing period.
- `description`: one sentence, used on cards, RSS and meta tags. Required for essays.
- `pubDate`: the day the PR is merged, not the day the draft started. Update it before marking ready.
- `updatedDate`: only when a published post gets a meaningful change.
- `status`: optional garden label, `draft | evolving | stable`. Notes default to `draft` or `evolving`. Leave it out if unsure; only dates show.
- `tags`: lowercase, reuse existing tags before adding a new one (`grep -rh "^tags" src/content`).
- No hero images on posts.

## The author's voice

Read two or three existing posts in `src/content/` before reviewing anything. The voice is:

- First person, conversational, practical. Talks to the reader as a peer ("you").
- Opinions stated plainly and backed by the author's own experience ("I personally have always…").
- Short sections under `###` headings, or numbered lists with **bold** key phrases.
- Light humor and asides are welcome; keep them.
- English is not the author's first language. Fix grammar, spelling and idiom ("Specially" → "Especially"), but keep their phrasing, rhythm and word choices when they are correct. Don't smooth it into generic prose.

Avoid in suggestions: corporate or marketing tone, filler openers ("In today's fast-paced world"), em-dash chains, "delve", "leverage", "landscape", triple-adjective lists, and summary conclusions that repeat the post.

## Checks

Run before marking a post PR ready:

```sh
yarn run check  # content schema + types: catches bad frontmatter
yarn build    # must pass; it's what Amplify runs
```

`yarn lint` covers `src/` code only; run it when a PR touches code.

## Site code

Design direction is "Paper & Terminal": minimal, techie, light reading pages, dark animated home hero. Keep interactions still under the cursor. Code style is Biome (tabs, width 100). Security headers and CSP live in `customHttp.yml`; a new external script, font or image host needs a CSP update there.
