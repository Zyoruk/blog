---
name: interview
description: Interview the author about a post's experiences to pull out concrete, first-hand material, one question at a time, and save the answers verbatim in .private/<slug>/interview.md. Use when the author says "interview me", "ask me about it", "help me find the story", or after /brainstorm has an angle but no examples yet.
argument-hint: "<slug>"
---

# Interview the author

Goal: find out what the author actually lived, in their own words. You ask and probe. You never write the post's prose, and you never supply an experience, opinion, number or quote. Follow `CLAUDE.md`, especially "Who writes what" and "Private until public-ready".

Everything here is private. Nothing from `.private/<slug>/` goes to GitHub, a comment, an issue or a commit.

## 1. Start from the angle

Read `.private/<slug>/brainstorm.md` if it exists. Say back, in one or two sentences, the angle you think the author has, and ask whether that's right. If there's no brainstorm yet, ask for the one claim they'd defend in an argument and stop there until they answer.

## 2. Ask one question at a time

Wait for each answer. Don't send a list. Prefer questions that ask for a moment, not an opinion:

- "When did this first show up for you? What happened right before?"
- "What did you do, specifically? What did the rest of the team do?"
- "How did you know it worked? What was the signal?"
- "What did it cost? Time, money, people, a deadline?"
- "What would you do differently now?"

## 3. Probe the vague parts

When an answer is general ("it was really hard", "it always works", "most teams struggle"), don't accept it and don't fill it in. Ask for the case:

- "Which team, and roughly when? Can you describe one instance?"
- "Is that from your own experience or something you've read? If you read it, where?"
- "What number or fact backs that up, and where would it come from?"
- "Would a reader who was there agree with that description?"

If the author says they don't know, record that as a gap. Don't offer a plausible answer.

## 4. Save as you go

Append every answer, verbatim, to `.private/<slug>/interview.md` with the question above it. Keep the author's words, including their English or Spanish and their mistakes. Tag the sentences that could become claims in the post:

- `[claim]` an opinion or assertion the post might make
- `[example]` a concrete episode
- `[number]` a figure, count or duration (keep the unit and the source the author gave)
- `[quote]` words said by someone else (ask whether it may be quoted)
- `[name]` any person, client, employer or internal project named

`[name]` and `[quote]` always need the public-ready check later.

## 5. Stop when it's enough

Stop when the author says so, or when every `[claim]` has at least one `[example]` or is marked as the author's opinion with nothing to back it. Then summarize, in a short list, what came out: the claims, the examples behind them, the gaps. Ask which gaps the author wants to fill now and which to leave.

## Language

Keep the author's language. If they answer in Spanish, save Spanish. Translating their words into the post's language is a separate decision: the author writes it, or asks for it in that session.
