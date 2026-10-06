// Site-wide motion: decoder-style text scramble on hover, and fade-up reveals
// on scroll. Both are skipped entirely when the reader prefers reduced motion.

const GLYPHS = "!<>-_\\/[]{}=+*^?#01";

function scramble(el: HTMLElement) {
	const text = el.dataset.text!;
	const start = performance.now();
	const duration = Math.min(500, 120 + text.length * 18);
	const step = (now: number) => {
		const solved = Math.floor(((now - start) / duration) * text.length);
		el.textContent = [...text]
			.map((char, i) =>
				i < solved || char === " " ? char : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
			)
			.join("");
		if (solved < text.length) requestAnimationFrame(step);
		else el.textContent = text;
	};
	requestAnimationFrame(step);
}

function initScramble() {
	for (const el of document.querySelectorAll<HTMLElement>("[data-scramble]")) {
		const text = el.textContent?.trim() ?? "";
		el.dataset.text = text;
		// Keep the accessible name stable while the visible text churns.
		if (!el.getAttribute("aria-label")) el.setAttribute("aria-label", text);
		el.addEventListener("pointerenter", () => scramble(el));
	}
}

// Only elements still below the fold get hidden, so nothing visible ever flashes.
function initReveal() {
	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				entry.target.classList.remove("pending");
				observer.unobserve(entry.target);
			}
		},
		{ rootMargin: "0px 0px -8% 0px" }
	);
	for (const el of document.querySelectorAll<HTMLElement>("[data-reveal]")) {
		if (el.getBoundingClientRect().top > window.innerHeight) {
			el.classList.add("pending");
			observer.observe(el);
		}
	}
}

if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
	initScramble();
	initReveal();
}
