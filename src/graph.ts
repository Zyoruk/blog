import {
	type SimulationLinkDatum,
	type SimulationNodeDatum,
	forceCollide,
	forceLink,
	forceManyBody,
	forceSimulation,
	forceX,
	forceY,
} from "d3-force";
import type { WritingItem } from "./writing";

export type NodeType = "center" | "tag" | "essay" | "note" | "page";

export interface GraphNode extends SimulationNodeDatum {
	id: string;
	type: NodeType;
	label: string;
	href?: string;
	title?: string;
	description?: string;
	meta?: string;
	status?: string;
	x: number;
	y: number;
}

export interface GraphEdge {
	a: string;
	b: string;
	x1: number;
	y1: number;
	x2: number;
	y2: number;
}

const PAGES = [
	{ id: "page:now", label: "/now", href: "/now", description: "What I'm focused on right now." },
	{ id: "page:uses", label: "/uses", href: "/uses", description: "The tools I use every day." },
];

// Lays the garden out at build time, so the HTML ships a finished graph made of
// real links. The browser only animates it. d3-force is deterministic, so the
// layout is stable between builds unless the content changes.
export function layoutGraph(items: WritingItem[], width: number, height: number, maxLabel: number) {
	const truncate = (s: string) => (s.length > maxLabel ? `${s.slice(0, maxLabel - 1)}…` : s);
	const nodes: GraphNode[] = [
		{ id: "center", type: "center", label: "", x: 0, y: 0, fx: 0, fy: 0 },
	];
	const links: SimulationLinkDatum<GraphNode>[] = [];

	const tags = [...new Set(items.flatMap((item) => item.tags ?? []))];
	for (const tag of tags) {
		const count = items.filter((item) => item.tags?.includes(tag)).length;
		nodes.push({
			id: `tag:${tag}`,
			type: "tag",
			label: `#${tag}`,
			href: `/blog?tag=${tag}`,
			title: `#${tag}`,
			description: `${count} ${count === 1 ? "piece" : "pieces"} of writing`,
			meta: "tag",
			x: 0,
			y: 0,
		});
		links.push({ source: "center", target: `tag:${tag}` });
	}

	for (const page of PAGES) {
		nodes.push({ ...page, type: "page", title: page.label, meta: "page", x: 0, y: 0 });
		links.push({ source: "center", target: page.id });
	}

	for (const item of items) {
		const id = `post:${item.href}`;
		const date = item.pubDate.toISOString().slice(0, 10);
		nodes.push({
			id,
			type: item.kind,
			label: truncate(item.title),
			href: item.href,
			title: item.title,
			description: item.description,
			meta: [item.kind, date, item.status].filter(Boolean).join(" · "),
			status: item.status,
			x: 0,
			y: 0,
		});
		const itemTags = item.tags?.length ? item.tags.map((tag) => `tag:${tag}`) : ["center"];
		for (const target of itemTags) links.push({ source: id, target });
	}

	const linkForce = forceLink<GraphNode, SimulationLinkDatum<GraphNode>>(links)
		.id((node) => node.id)
		.distance((link) => ((link.source as GraphNode).type === "center" ? 130 : 95))
		.strength(0.6);

	forceSimulation(nodes)
		.force("link", linkForce)
		.force("charge", forceManyBody().strength(-420))
		.force(
			"collide",
			forceCollide<GraphNode>((node) => (node.type === "center" ? 60 : 34))
		)
		// Pull harder along the short axis, so the graph fills the frame's shape.
		.force("x", forceX(0).strength(width > height ? 0.03 : 0.12))
		.force("y", forceY(0).strength(width > height ? 0.12 : 0.03))
		.stop()
		.tick(400);

	// Scale into the frame, leaving room for labels on either side.
	const padX = Math.min(width * 0.28, 150);
	const padY = 48;
	const maxX = Math.max(...nodes.map((n) => Math.abs(n.x))) || 1;
	const maxY = Math.max(...nodes.map((n) => Math.abs(n.y))) || 1;
	const scale = Math.min((width / 2 - padX) / maxX, (height / 2 - padY) / maxY);
	for (const node of nodes) {
		node.x = Math.round(width / 2 + node.x * scale);
		node.y = Math.round(height / 2 + node.y * scale);
	}

	const byId = new Map(nodes.map((node) => [node.id, node]));
	const edges: GraphEdge[] = links.map((link) => {
		const a = byId.get((link.source as GraphNode).id)!;
		const b = byId.get((link.target as GraphNode).id)!;
		return { a: a.id, b: b.id, x1: a.x, y1: a.y, x2: b.x, y2: b.y };
	});

	return { nodes, edges, center: { x: width / 2, y: height / 2 } };
}
