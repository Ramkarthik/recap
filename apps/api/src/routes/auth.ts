import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@recap/db";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: false,
    },
    trustedOrigins: [process.env.APP_URL!],
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    },
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    // Create welcome podcast for new user
                    const welcomeSummary = `Hey there — and welcome to Recap.

First, thank you for signing up. We're excited to have you here.

Even though this is an AI generated podcast, the person behind this is not. My name is Ramkarthik and I'm the solo developer of Recap.

If this is your first time listening, you might be thinking:
"Okay… what exactly is this?"

Recap is simple.
Every day, you save the articles, posts, or links that matter to you — and Recap turns them into a short podcast episode you can listen to.

No inbox overload.
No tabs piling up.
Just a calm, personal recap of what you wanted to read.

So before tomorrow's episode arrives, here's what you need to do: Start saving articles.

Add anything you find interesting — news, essays, blog posts, or long reads.
We'll take it from there.

Tomorrow morning, you'll wake up to your first personalized episode in your feed.

If you ever want help, have feedback, or just want to say hello, you can reach the me anytime at:
ram@kramkarthik.com

I actually read every message.

Alright, that's it for now.
Welcome again — we're happy you're here.

I'll see you tomorrow, with your first recap.
Until then… take care.`;

                    await prisma.podcast.create({
                        data: {
                            userId: user.id,
                            title: "Welcome to Recap",
                            date: new Date(Date.now() - 24 * 60 * 60 * 1000),
                            description: "Welcome to Recap! Learn how to get started.",
                            summary: welcomeSummary,
                            audioUrl: "https://pub-63a4ee3f3e8f4adbbb2ea8c928289b75.r2.dev/assets/welcome.mp3",
                            audioLength: 71000,
                            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
                            updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
                        },
                    });
                },
            },
        },
    },
});

