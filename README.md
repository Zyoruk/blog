# blog.devpand.com

Source of my blog: essays and notes on AI, cloud, architecture and engineering teams.

**Live:** https://blog.devpand.com · **RSS:** https://blog.devpand.com/rss.xml

## Stack

- [Astro](https://astro.build), static output, Markdown content in `src/content/blog/`
- Hosted on AWS Amplify (`amplify.yml` holds the build spec)
- Security headers, including a Content Security Policy, set in `customHttp.yml`
- Installable PWA with an offline service worker (`public/sw.js`)

## Run locally

```sh
yarn install
yarn dev        # http://localhost:4321
yarn build      # output in dist/
yarn check      # Astro type and content checks
yarn lint       # Biome
```

Requires Node 18.20.8 or newer.

## Writing a post

Add a Markdown file to `src/content/blog/`. The frontmatter schema lives in `src/content.config.ts`.
