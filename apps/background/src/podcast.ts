import { prisma } from "@recap/db";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { generatePodcastAudio, generatePodcastMetadata } from "./ai";
import type { PodcastEpisode } from "@recap/shared";


const s3Client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

interface Article {
    title: string;
    summary: string;
    category: string;
}

interface Payload {
    userId: string;
    date: string;
    articleIds: string[];
}

const articleTransitions = [
    "Now, shifting gears...",
    "Let’s move to our next topic...",
    "Switching over to...",
    "And now, turning our attention to..."
]

const categoryNumberWords = [
    "first",
    "second",
    "third",
    "fourth",
    "fifth",
    "sixth",
    "seventh",
    "eighth",
    "ninth",
    "tenth",
]

export async function generatePodcast(payload: Payload, requestId: string, idempotencyKey: string) {
    const { userId, date, articleIds } = payload;
    console.log("Generating podcast for user", userId, "on", date, "for requestId", requestId, "and idempotencyKey", idempotencyKey);
    console.log("ArticleIds", articleIds);
    const userArticles = await prisma.userArticle.findMany({
        where: {
            userId,
            articleId: { in: articleIds },
        },
        include: {
            article: true,
        },
        orderBy: {
            addedAt: "asc" as const,
        },
    });

    const articles = userArticles.map(ua => ua.article).sort((a, b) => {
        const catA = a.category || "Uncategorized";
        const catB = b.category || "Uncategorized";
        if (catA === catB) return 0;
        if (catA < catB) return -1;
        return 1;
    });

    console.log("Generating podcast episode summary for user", userId, "on", date, "for requestId", requestId, "and idempotencyKey", idempotencyKey);
    // const podcast = await generatePodcastEpisodeSummary(articles);
    const metadata = await generatePodcastMetadata(articles);
    const articleSummaries = articles.map(article => {
        return {
            title: article.title,
            summary: article.summary,
            category: article.category
        }
    });

    let podcastSummary = "Hello, I'm your host from Recap - the app that provides you with a daily podcast of your saved articles. Here's what's in today's podcast:\n\n";
    let prevCategory = "";
    let categoryNumber = 0;
    let categoryChange = false;
    for (let i = 0; i < articleSummaries.length; i++) {
        const article = articleSummaries[i];
        if (article.category !== prevCategory) {
            prevCategory = article.category || "";
            categoryNumber++;
            categoryChange = true;
        } else {
            categoryChange = false;
        }

        if (categoryChange) {
            podcastSummary += `\nOur ${categoryNumberWords[categoryNumber - 1]} category is ${prevCategory}:\n\n`;
        }

        if (i > 0 && !categoryChange) {
            podcastSummary += articleTransitions[Math.floor(Math.random() * articleTransitions.length)];
        }

        podcastSummary += `${article.title}: ${article.summary}\n\n`;
    }

    podcastSummary += "\nThat's all we have for today. Thank you for listening to Recap. Have a great day!";

    const podcast: PodcastEpisode = {
        title: metadata?.title || "",
        description: metadata?.description || "",
    }

    if (!podcast) return;

    console.log("Generating podcast audio for user", userId, "on", date, "for requestId", requestId, "and idempotencyKey", idempotencyKey);
    const audio = await generatePodcastAudio(podcastSummary);

    if (!audio) return;

    console.log("Uploading podcast audio for user", userId, "on", date, "for requestId", requestId, "and idempotencyKey", idempotencyKey);

    // Debug audio type
    console.log("Audio keys:", Object.keys(audio as any));

    // audio object has the data in uint8ArrayData per logs
    const audioData = audio.uint8Array;
    const audioBuffer = Buffer.from(audioData);
    const audioLength = audioBuffer.length;
    console.log("Audio Size:", audioLength);

    const now = Date.now();
    const filename = `podcasts/${userId}/${now}.mp3`;
    // Save the file to local
    // if (!fs.existsSync(`/podcasts/${userId}`)) {
    //     fs.mkdirSync(`/podcasts/${userId}`);
    // }
    // fs.writeFileSync(`/podcasts/${userId}/${date}.mp3`, audioBuffer);
    console.log("Uploading podcast audio for user with filename", userId, "on", date, "for requestId", requestId, "and idempotencyKey", idempotencyKey, "to", filename);
    await s3Client.send(
        new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: filename,
            Body: audioBuffer,
            ContentType: "audio/mpeg",
        })
    );

    const audioUrl = `${process.env.R2_PUBLIC_URL}/${filename}`;
    console.log("Adding the podcast entry into the podcast table for user", userId, "on", date, "for requestId", requestId, "and idempotencyKey", idempotencyKey);
    await prisma.podcast.create({
        data: {
            userId,
            title: podcast.title,
            description: podcast.description,
            summary: podcastSummary,
            audioUrl,
            audioLength,
            date: new Date(date),
        },
    });
    // Update articles to processed
    await prisma.article.updateMany({
        where: {
            id: { in: articleIds },
        },
        data: {
            processed: true,
        },
    });
}