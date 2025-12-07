import { Hono } from "hono";
import { prisma } from "@recap/db";

const app = new Hono();

// Public RSS feed by feedUrl
app.get("/:feedUrl", async (c) => {
    const feedUrl = c.req.param("feedUrl");

    const user = await prisma.user.findUnique({
        where: { feedUrl },
        include: {
            podcasts: {
                orderBy: { date: "desc" as const },
                take: 50,
            },
        },
    });

    if (!user) {
        return c.text("Feed not found", 404);
    }

    const podcastName = user.podcastName || "Recap";
    const appImageUrl = process.env.APP_IMAGE_URL || "https://pub-63a4ee3f3e8f4adbbb2ea8c928289b75.r2.dev/assets/recap-podcast-thumbnail.png";
    const baseUrl = process.env.BASE_URL || "https://api.recapfm.com";
    const appUrl = process.env.APP_URL || "https://recapfm.com";
    function millisToMinutesAndSeconds(millis: number) {
        var minutes = Math.floor(millis / 60000);
        var seconds = ((millis % 60000) / 1000).toFixed(0);
        return minutes + ":" + (parseInt(seconds) < 10 ? '0' : '') + seconds;
    }

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${podcastName}</title>
    <description>Daily recap of your saved articles</description>
    <link>${appUrl}</link>
    <language>en-us</language>
    <itunes:author>Recap</itunes:author>
    <itunes:image href="${appImageUrl}"/>
    <image>
      <url>${appImageUrl}</url>
      <title>${podcastName}</title>
      <link>${baseUrl}/feed/${feedUrl}</link>
    </image>
    ${user.podcasts.map(podcast => `
    <item>
      <title>${escapeXml(podcast.title)}</title>
      <description>${escapeXml(podcast.description || "")}</description>
      <content:encoded><![CDATA[${podcast.summary}]]></content:encoded>
      <pubDate>${new Date(podcast.date).toUTCString()}</pubDate>
      <guid isPermaLink="false">${appUrl}/podcast/${podcast.id}</guid>
      ${podcast.audioUrl ? `<enclosure url="${podcast.audioUrl}" type="audio/mpeg" ${podcast.audioLength ? `length="${podcast.audioLength}"` : ''} />` : ''}
      <itunes:image href="${appImageUrl}"/>
      <itunes:duration>${millisToMinutesAndSeconds(podcast.audioLength || 0)}</itunes:duration>
    </item>
    `).join('')}
  </channel>
</rss>`;

    return c.text(rss, 200, {
        "Content-Type": "application/xml",
    });
});

function escapeXml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

export default app;