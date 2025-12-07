import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { authClient } from '../../lib/auth-client';

export const Route = createFileRoute('/_auth/')({
    beforeLoad: async () => {
        const session = await authClient.getSession();
        if (session.data?.session) {
            throw redirect({ to: '/dashboard' });
        }
    },
    component: Landing,
});

function Landing() {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-24 pb-32 md:pt-32">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
                <div className="container relative mx-auto px-4 text-center">
                    <div className="mx-auto mb-6 flex max-w-fit items-center justify-center rounded-full border bg-background/50 px-4 py-1.5 backdrop-blur">
                        <span className="text-sm font-medium">✨ Listen to your reading list</span>
                    </div>
                    <h1 className="mx-auto mb-8 max-w-4xl text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl">
                        Your saved articles,<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50">
                            delivered as podcast.
                        </span>
                    </h1>
                    <p className="mx-auto mb-12 max-w-2xl text-lg text-muted-foreground md:text-xl">
                        Save interesting articles throughout the day. Recap will turn them into a podcast and deliver it to your favorite app by morning.
                    </p>
                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                        <Link
                            to="/login"
                            className="h-12 rounded-full bg-primary px-8 text-lg font-medium text-primary-foreground hover:bg-primary/90 flex items-center justify-center"
                        >
                            Start Listening for Free
                        </Link>
                        <Link
                            to="#"
                            className="h-12 rounded-full border bg-background px-8 text-lg font-medium hover:bg-accent flex items-center justify-center"
                        >
                            View Demo
                        </Link>
                    </div>

                    {/* Hero Image/Visual Placeholder */}
                    <div className="mx-auto mt-20 max-w-5xl rounded-xl border bg-card p-2 shadow-2xl">
                        <div className="aspect-video w-full rounded-lg bg-muted/50 flex items-center justify-center">
                            <p className="text-muted-foreground">App Dashboard / Player Preview</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-3xl font-bold md:text-4xl">How it works</h2>
                        <p className="text-muted-foreground">Three simple steps to reclaim your reading list.</p>
                    </div>

                    <div className="grid gap-12 md:grid-cols-3">
                        <Feature
                            icon="📥"
                            title="Save for later"
                            description="Use our browser extension or mobile share sheet to save articles you find interesting."
                        />
                        <Feature
                            icon="🤖"
                            title="AI Summarization"
                            description="At the end of the day, we condense your articles into concise, digestible summaries."
                        />
                        <Feature
                            icon="🎧"
                            title="Daily Podcast"
                            description="Wake up to a fresh podcast episode generated just for you. Listen on Spotify, Apple Podcasts, or in-app."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="rounded-3xl bg-primary px-6 py-16 text-center md:px-12 md:py-24">
                        <h2 className="mb-6 text-3xl font-bold text-primary-foreground md:text-5xl">
                            Ready to clear your queue?
                        </h2>
                        <p className="mx-auto mb-10 max-w-2xl text-lg text-primary-foreground/80">
                            Join thousands of readers who are finally getting through their content.
                        </p>
                        <Link
                            to="/login"
                            className="inline-flex h-14 items-center justify-center rounded-full bg-background px-8 text-lg font-bold text-primary transition-colors hover:bg-background/90"
                        >
                            Get Started Now
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

function Feature({ icon, title, description }: { icon: string; title: string; description: string }) {
    return (
        <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-4xl">
                {icon}
            </div>
            <h3 className="mb-3 text-xl font-bold">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </div>
    );
}

export default Landing;