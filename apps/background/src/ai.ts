import { generateObject, generateText } from 'ai';
import 'dotenv/config';
import { articleSummarySchema, podcastEpisodeSchema, type ArticleSummary, type PodcastEpisode } from '@recap/shared';
import { prisma, type Article } from '@recap/db';
import { experimental_generateSpeech as generateSpeech } from 'ai';
import { openai } from '@ai-sdk/openai';
import type { ArticleMetadata } from '@recap/shared/types/article-metadata';

const textModel = "gpt-5-mini";
const audioModel = "gpt-4o-mini-tts";

// TODO: Replace this with user's choice from a list of voices
const voice = "cedar";

export async function generateArticleSummary(article: ArticleMetadata) {
    if (!article) return;
    const system = await prisma.prompt.findFirst({
        where: {
            type: "article_summary"
        }
    });
    const { object } = await generateObject({
        model: openai(textModel),
        schema: articleSummarySchema,
        system: system?.prompt || "",
        prompt: `${article.title}: ${article.content}`
    });
    return object;
}

export async function generatePodcastMetadata(articles: Article[]) {
    if (!articles.length) return;
    const system = await prisma.prompt.findFirst({
        where: {
            type: "podcast_metadata"
        }
    });
    const { object } = await generateObject({
        model: openai(textModel),
        schema: podcastEpisodeSchema,
        system: system?.prompt || "",
        prompt: JSON.stringify(articles.map(article => {
            return {
                title: article.title,
            }
        }))
    });
    return object;
}

export async function generatePodcastEpisodeSummary(articles: Article[]) {
    if (!articles.length) return;
    const system = await prisma.prompt.findFirst({
        where: {
            type: "podcast_summary"
        }
    });
    const { object } = await generateObject({
        model: openai(textModel),
        schema: podcastEpisodeSchema,
        system: system?.prompt || "",
        prompt: JSON.stringify(articles.map(article => {
            return {
                title: article.title,
                summary: article.summary,
                category: article.category
            }
        }))
    });
    return object;
}

export async function generatePodcastAudio(script: string) {
    const { audio } = await generateSpeech({
        model: openai.speech(audioModel),
        text: script,
        voice,
    });

    return audio;
}
