# Recap

Get a daily recap of your favorite articles deliver to your Podcast.

## Core Idea

User finds interesting articles, saves them to Recap. At the end of the day, Recap takes all the articles, summarizes them, categorizes them, creates a podcast episode, and updates the user specific podcast feed.

## Tech Stack

1. Web app: Tanstack Router (Deployed to Cloudflare Pages)
2. API: Hono (Deployed to Cloudflare Workers)
3. Background: Hono (Deployed to Render)
4. Database: Postgres (Deployed to Prisma Postgres)
5. ORM: Prisma
6. Package manager: Bun
7. Auth: BetterAuth
8. CSS: Tailwind

## Pages

1. Landing page (route: /) - Unauthenticated
2. Login page (Google/Twitter) (route: /login) - Unauthenticated
3. Dashboard (route: /dashboard) - Authenticated
4. Save Article (route: /save/:title/:url) - Authenticated
5. Podcasts (route: /podcasts) - Authenticated
6. Podcast (route: /podcast/:id) - Authenticated
7. Articles (route: /articles) - Authenticated
8. Article (route: /article/:id) - Authenticated