import { getCollection } from "astro:content";

// Filter for getCollection: drop `hidden: true` entries outside `astro dev`.
export const visible = ({ data }: { data: { hidden: boolean } }) =>
	import.meta.env.DEV || !data.hidden;

// Each collection is one kind of writing, served under its own path.
export const KINDS = {
	essay: { collection: "blog", path: "blog", plural: "essays" },
	note: { collection: "notes", path: "notes", plural: "notes" },
	guide: { collection: "guides", path: "guides", plural: "guides" },
	case: { collection: "cases", path: "cases", plural: "case studies" },
} as const;

export type Kind = keyof typeof KINDS;

// Case studies read as "case study" in labels; the rest use the kind as is.
export const kindLabel = (kind: Kind) => (kind === "case" ? "case study" : kind);

// All writing merged into one newest-first list, for the home page, /blog and RSS.
export async function getWriting() {
	const lists = await Promise.all(
		(Object.keys(KINDS) as Kind[]).map(async (kind) => {
			const { collection, path } = KINDS[kind];
			const entries = await getCollection(collection, visible);
			return entries.map((entry) => ({ ...entry.data, kind, href: `/${path}/${entry.id}/` }));
		})
	);
	return lists.flat().sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());
}

export type WritingItem = Awaited<ReturnType<typeof getWriting>>[number];

// Shared view-transition name, so a post's title morphs from the list into the post page.
export const transitionName = (href: string) => `t${href.replace(/[^a-z0-9]/gi, "-")}`;
