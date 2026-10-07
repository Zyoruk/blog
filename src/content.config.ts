import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Garden-lite: how settled the thinking is. Optional — leave it out and only dates show.
const status = z.enum(["draft", "evolving", "stable"]).optional();

// Hidden entries render in `astro dev` but are left out of production builds (and PR previews).
const hidden = z.boolean().default(false);

// Essays: long-form posts.
const blog = defineCollection({
	loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		status,
		hidden,
		tags: z.array(z.string()).optional(),
	}),
});

// Notes: short, unpolished thoughts. Can be a few lines.
const notes = defineCollection({
	loader: glob({ base: "./src/content/notes", pattern: "**/*.{md,mdx}" }),
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		status,
		hidden,
		tags: z.array(z.string()).optional(),
	}),
});

export const collections = { blog, notes };
