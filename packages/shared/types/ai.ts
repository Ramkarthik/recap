import zod from "zod";

export const articleSummarySchema = zod.object({
    summary: zod.string(),
    category: zod.string(),
});

export const podcastEpisodeSchema = zod.object({
    title: zod.string(),
    description: zod.string(),
});

export type ArticleSummary = zod.infer<typeof articleSummarySchema>;
export type PodcastEpisode = zod.infer<typeof podcastEpisodeSchema>;