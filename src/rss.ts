import { XMLParser } from "fast-xml-parser";

export interface RSSItem { title: string; link: string; description: string; pubDate: string; }
export interface RSSFeed { title: string; link: string; description: string; items: RSSItem[]; }

export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
  const resp = await fetch(feedURL, { headers: { "User-Agent": "gator" } });
  const xmlStr = await resp.text();
  const parser = new XMLParser();
  const parsed = parser.parse(xmlStr);

  const channel = parsed.rss?.channel || parsed.feed;
  if (!channel) throw new Error("Missing feed metadata fields");

  const title = channel.title || "No title";
  const link = channel.link?.href || channel.link || "";
  const description = channel.description || channel.subtitle || "";

  const itemsRaw = parsed.rss?.channel?.item || parsed.feed?.entry || [];
  const itemsArr = Array.isArray(itemsRaw) ? itemsRaw : [itemsRaw];

  const items: RSSItem[] = itemsArr
    .map((i) => {
      const t = i.title;
      const l = i.link?.href || i.link || "";
      const d = i.description || i.summary || "";
      const p = i.pubDate || i.updated || "";

      if (!t || !l || !d || !p) return null;
      return { title: t, link: l, description: d, pubDate: p };
    })
    .filter(Boolean) as RSSItem[];

  return { title, link, description, items };
}

