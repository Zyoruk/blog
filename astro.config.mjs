// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://blog.devpand.com',
	integrations: [mdx(), sitemap()],
	vite: {
		define: {
			__DATE__: `'${new Date().toISOString()}'`,
		},
	},
	server: {
		headers: {
			'X-Content-Type-Options': 'nosniff',
			'X-Frame-Options': 'DENY',
			'X-XSS-Protection': '1; mode=block',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
			'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
			'Content-Security-Policy': [
				"default-src 'self'",
				"script-src 'self' 'unsafe-inline'", // Required for Astro inline scripts and service worker
				"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Google Fonts CSS
				"font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com https://cdn.jsdelivr.net", // Google Fonts
				"img-src 'self' data: https: https://cdn.jsdelivr.net", // Allow images from HTTPS sources and data URLs
				"connect-src 'self'", // API calls only to same origin
				"object-src 'none'", // Block plugins like Flash
				"base-uri 'self'", // Restrict base tag
				"form-action 'self'", // Forms only to same origin
				"frame-ancestors 'none'", // Prevent embedding (same as X-Frame-Options)
				"upgrade-insecure-requests" // Force HTTPS
			].join('; '),
		},
	},
});
