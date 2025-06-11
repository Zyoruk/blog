/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
	readonly SITE_URL?: string;
	readonly SITE_TITLE?: string;
	readonly SITE_DESCRIPTION?: string;
	readonly GOOGLE_ANALYTICS_ID?: string;
	readonly TWITTER_HANDLE?: string;
	readonly GITHUB_USERNAME?: string;
	readonly NODE_ENV: "development" | "production" | "test";
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
