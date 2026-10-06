import { getCollection } from "astro:content";

export type Kind = "essay" | "note";

// Essays and notes merged into one newest-first list, for the home page, /blog and RSS.
export async function getWriting() {
	const [essays, notes] = await Promise.all([getCollection("blog"), getCollection("notes")]);
	return [
		...essays.map((entry) => ({
			...entry.data,
			kind: "essay" as Kind,
			href: `/blog/${entry.id}/`,
		})),
		...notes.map((entry) => ({ ...entry.data, kind: "note" as Kind, href: `/notes/${entry.id}/` })),
	].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());
}

export type WritingItem = Awaited<ReturnType<typeof getWriting>>[number];

// Shared view-transition name, so a post's title morphs from the list into the post page.
export const transitionName = (href: string) => `t${href.replace(/[^a-z0-9]/gi, "-")}`;
