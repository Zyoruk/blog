import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Garden-lite: how settled the thinking is. Optional — leave it out and only dates show.
const status = z.enum(["draft", "evolving", "stable"]).optional();

// Hidden entries render in `astro dev` but are left out of production builds (and PR previews).
const hidden = z.boolean().default(false);

// A published source a post relies on. Every claim that isn't the author's own
// experience points at one of these (usually through a Markdown footnote).
const source = z.object({
	title: z.string(),
	url: z.string().url(),
	author: z.string().optional(),
	publisher: z.string().optional(),
	date: z.coerce.date().optional(),
});

const base = {
	title: z.string(),
	description: z.string(),
	pubDate: z.coerce.date(),
	updatedDate: z.coerce.date().optional(),
	status,
	hidden,
	tags: z.array(z.string()).optional(),
	sources: z.array(source).optional(),
};

const collection = <T extends z.ZodRawShape>(folder: string, shape: T) =>
	defineCollection({
		loader: glob({ base: `./src/content/${folder}`, pattern: "**/*.{md,mdx}" }),
		schema: z.object(shape),
	});

// Essays: long-form opinion, backed by the author's own experience.
const blog = collection("blog", base);

// Notes: short, unpolished thoughts. Can be a few lines.
const notes = collection("notes", { ...base, description: z.string().optional() });

// Guides: explain a topic. Sources are required; the author's experience is the angle.
const guides = collection("guides", { ...base, sources: z.array(source).min(1) });

// Case studies: one real piece of work, told as context, problem, decision and outcome.
// `role` and `period` say what the author did and when, so the reader can weigh it.
const cases = collection("cases", {
	...base,
	role: z.string(),
	period: z.string(),
});

export const collections = { blog, notes, guides, cases };
