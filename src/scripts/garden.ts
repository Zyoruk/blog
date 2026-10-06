// Brings the home page's garden graph to life. The graph is already laid out
// in the HTML; this only adds the boot intro, idle float, cursor push, and the
// hover highlight with a preview card.

interface Node {
	el: SVGGElement | SVGAElement;
	id: string;
	bx: number; // base position from the build-time layout
	by: number;
	x: number; // current animated position
	y: number;
	phase: number;
}

const BOOT_MS = 1150; // matches the typing time of the boot lines in CSS
const PUSH_RADIUS = 120;
const PUSH_FORCE = 28;

const translate = (x: number, y: number, s = 1) => `translate(${x}px, ${y}px) scale(${s})`;

export function initGarden() {
	const hero = document.querySelector<HTMLElement>("[data-hero]");
	// ponytail: picks the wide or tall graph once at load. Resizing across the
	// 700px breakpoint shows the other one static (links still work); re-init on
	// a matchMedia change if that ever matters.
	const svg = [...document.querySelectorAll<SVGSVGElement>(".hero .graph")].find(
		(el) => getComputedStyle(el).display !== "none"
	);
	if (!hero || !svg) return;

	const nodes = new Map<string, Node>();
	svg.querySelectorAll<SVGGElement>(".node").forEach((el, i) => {
		const [, x, y] = el.style.transform.match(/translate\(([-\d.]+)px, ([-\d.]+)px\)/)!.map(Number);
		nodes.set(el.dataset.id!, { el, id: el.dataset.id!, bx: x, by: y, x, y, phase: i * 1.7 });
	});
	const edges = [...svg.querySelectorAll<SVGLineElement>(".edge")].map((el) => ({
		el,
		a: nodes.get(el.dataset.a!)!,
		b: nodes.get(el.dataset.b!)!,
	}));
	const center = nodes.get("center")!;
	const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

	setupHover(hero, svg, edges);

	const root = document.documentElement;
	if (root.dataset.intro === "play") {
		playIntro(hero, svg, nodes, edges, center).then(() => {
			delete root.dataset.intro;
			try {
				sessionStorage.setItem("booted", "1");
			} catch {}
			if (!reduceMotion) startFloat(hero, svg, nodes, edges);
		});
	} else if (!reduceMotion) {
		startFloat(hero, svg, nodes, edges);
	}
}

function playIntro(
	hero: HTMLElement,
	svg: SVGSVGElement,
	nodes: Map<string, Node>,
	edges: { el: SVGLineElement; a: Node; b: Node }[],
	center: Node
) {
	const animations: Animation[] = [];
	const bigScale = svg.classList.contains("tall") ? 2.4 : 3;
	const ease = "cubic-bezier(.7, 0, .2, 1)";

	// 1. The logo sits big while the boot lines type, then shrinks into the center node.
	animations.push(
		center.el.animate(
			[
				{ transform: translate(center.bx, center.by, bigScale) },
				{ transform: translate(center.bx, center.by) },
			],
			{ duration: 700, delay: BOOT_MS, easing: ease, fill: "both" }
		)
	);
	const boot = hero.querySelector<HTMLElement>(".boot")!;
	animations.push(
		boot.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, delay: BOOT_MS, fill: "both" })
	);

	// 2. Topics burst out of the logo first, then the writing hanging off them.
	const rank = { tag: 0, page: 1, essay: 2, note: 2 } as Record<string, number>;
	const others = [...nodes.values()]
		.filter((node) => node !== center)
		.sort((a, b) => rank[a.el.classList[1]] - rank[b.el.classList[1]]);
	const delays = new Map<Node, number>();
	others.forEach((node, i) => {
		const delay = BOOT_MS + 350 + i * 70;
		delays.set(node, delay);
		animations.push(
			node.el.animate(
				[
					{ transform: translate(center.bx, center.by, 0), opacity: 0 },
					{ transform: translate(node.bx, node.by), opacity: 1 },
				],
				{ duration: 750, delay, easing: "cubic-bezier(.2, .9, .3, 1.15)", fill: "both" }
			)
		);
	});

	// 3. Each link draws itself as its outer node arrives.
	for (const edge of edges) {
		const delay = Math.max(delays.get(edge.a) ?? 0, delays.get(edge.b) ?? 0);
		animations.push(
			edge.el.animate(
				[
					{ strokeDashoffset: 1, opacity: 0 },
					{ strokeDashoffset: 0, opacity: 1 },
				],
				{ duration: 600, delay: delay + 100, easing: ease, fill: "both" }
			)
		);
	}

	const hud = [...hero.querySelectorAll<HTMLElement>(".hud")];
	const end = Math.max(...delays.values()) + 400;
	for (const el of hud) {
		animations.push(
			el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: end, fill: "both" })
		);
	}

	// Animations now own the hidden state; hand over from the pre-paint CSS.
	document.documentElement.dataset.intro = "run";

	// Any click or key skips straight to the end.
	const skip = () => {
		for (const animation of animations) animation.finish();
	};
	window.addEventListener("pointerdown", skip, { once: true });
	window.addEventListener("keydown", skip, { once: true });

	return Promise.all(animations.map((animation) => animation.finished)).then(() => {
		window.removeEventListener("pointerdown", skip);
		window.removeEventListener("keydown", skip);
		// Final keyframes equal the inline styles, so cancelling is seamless.
		for (const animation of animations) animation.cancel();
	});
}

// Nodes drift gently and lean away from the cursor. Runs only while the hero is on screen.
function startFloat(
	hero: HTMLElement,
	svg: SVGSVGElement,
	nodes: Map<string, Node>,
	edges: { el: SVGLineElement; a: Node; b: Node }[]
) {
	let pointer: DOMPoint | null = null;
	let frame = 0;

	hero.addEventListener("pointermove", (event) => {
		const rect = hero.getBoundingClientRect();
		hero.style.setProperty("--gx", `${event.clientX - rect.left}px`);
		hero.style.setProperty("--gy", `${event.clientY - rect.top}px`);
		const matrix = svg.getScreenCTM();
		pointer = matrix
			? new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse())
			: null;
	});
	hero.addEventListener("pointerleave", () => {
		pointer = null;
	});

	const tick = (t: number) => {
		for (const node of nodes.values()) {
			if (node.id === "center") continue;
			let tx = node.bx + Math.sin(t / 1600 + node.phase) * 3;
			let ty = node.by + Math.cos(t / 1900 + node.phase) * 3;
			if (pointer) {
				const dx = node.bx - pointer.x;
				const dy = node.by - pointer.y;
				const d = Math.hypot(dx, dy);
				if (d > 0 && d < PUSH_RADIUS) {
					const push = ((PUSH_RADIUS - d) / PUSH_RADIUS) * PUSH_FORCE;
					tx += (dx / d) * push;
					ty += (dy / d) * push;
				}
			}
			node.x += (tx - node.x) * 0.1;
			node.y += (ty - node.y) * 0.1;
			node.el.style.transform = translate(node.x, node.y);
		}
		for (const { el, a, b } of edges) {
			el.setAttribute("x1", a.x.toFixed(1));
			el.setAttribute("y1", a.y.toFixed(1));
			el.setAttribute("x2", b.x.toFixed(1));
			el.setAttribute("y2", b.y.toFixed(1));
		}
		frame = requestAnimationFrame(tick);
	};

	new IntersectionObserver(([entry]) => {
		cancelAnimationFrame(frame);
		if (entry.isIntersecting) frame = requestAnimationFrame(tick);
	}).observe(hero);
}

// Hover or focus a node: light up its neighbours and show a preview card.
function setupHover(
	hero: HTMLElement,
	svg: SVGSVGElement,
	edges: { el: SVGLineElement; a: Node; b: Node }[]
) {
	const card = hero.querySelector<HTMLElement>(".card")!;
	const [meta, title, desc] = card.querySelectorAll("p");

	const show = (el: SVGAElement) => {
		svg.classList.add("focus");
		el.classList.add("lit");
		for (const edge of edges) {
			if (edge.a.el !== el && edge.b.el !== el) continue;
			edge.el.classList.add("lit");
			edge.a.el.classList.add("lit");
			edge.b.el.classList.add("lit");
		}

		meta.textContent = el.dataset.meta ?? "";
		title.textContent = el.dataset.title ?? "";
		desc.textContent = el.dataset.desc ?? "";
		card.hidden = false;

		const heroRect = hero.getBoundingClientRect();
		const nodeRect = el.querySelector("circle, rect")!.getBoundingClientRect();
		const cardRect = card.getBoundingClientRect();
		let left = nodeRect.right - heroRect.left + 16;
		if (left + cardRect.width > heroRect.width - 16)
			left = nodeRect.left - heroRect.left - cardRect.width - 16;
		const top = nodeRect.top - heroRect.top + nodeRect.height / 2 - cardRect.height / 2;
		card.style.left = `${Math.max(16, left)}px`;
		card.style.top = `${Math.min(Math.max(16, top), heroRect.height - cardRect.height - 16)}px`;
	};

	const hide = () => {
		svg.classList.remove("focus");
		for (const lit of svg.querySelectorAll(".lit")) lit.classList.remove("lit");
		card.hidden = true;
	};

	for (const el of svg.querySelectorAll<SVGAElement>("a.node")) {
		el.addEventListener("pointerenter", () => show(el));
		el.addEventListener("pointerleave", hide);
		el.addEventListener("focus", () => show(el));
		el.addEventListener("blur", hide);
	}
}
