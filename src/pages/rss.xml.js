import rss from "@astrojs/rss";
import { SITE_DESCRIPTION, SITE_TITLE } from "../consts";
import { getWriting } from "../writing";

export async function GET(context) {
	const items = await getWriting();
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: items.map((item) => ({
			title: item.title,
			description: item.description,
			pubDate: item.pubDate,
			categories: [item.kind, ...(item.tags ?? [])],
			link: item.href,
		})),
	});
}
