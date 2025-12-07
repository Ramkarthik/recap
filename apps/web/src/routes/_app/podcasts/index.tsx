import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';
import { fetchApi } from '../../../lib/api';
import { Headphones, Calendar } from 'lucide-react';
// import { Loading } from '../../../components/Loading';

export const Route = createFileRoute('/_app/podcasts/')({
    loader: async () => {
        try {
            const res = await fetchApi('/api/podcasts');
            return { podcasts: res.podcasts as Podcast[] };
        } catch (error) {
            console.error("Failed to fetch podcasts", error);
            throw error;
        }
    },
    component: podcasts,
    validateSearch: (search: Record<string, unknown>) => {
        return {
            processing: search.processing as boolean | undefined,
        };
    },
});

interface Podcast {
    id: string;
    title: string;
    date: string;
    description: string | null;
    audioUrl: string | null;
}

function podcasts() {
    const { podcasts } = Route.useLoaderData();
    const router = useRouter();
    const { processing } = Route.useSearch();
    // const [podcasts, setPodcasts] = useState<Podcast[]>([]); // Removed
    // const [loading, setLoading] = useState(true); // Removed

    useEffect(() => {
        const interval = setInterval(() => {
            router.invalidate();
        }, 30000);
        return () => clearInterval(interval);
    }, [router]);

    // Loading handled by router if needed, usually we just show stale data while revalidating
    // if (loading) { return <Loading />; }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight">Your Podcasts</h1>
            {processing && <div className="text-center bg-orange-50 text-orange-600 p-2 border border-dashed rounded-lg text-muted-foreground">
                Podcast will be generated shortly. It will also show up on your Podcast player if you're added the RSS feed.
            </div>}
            <div className="grid gap-4">
                {podcasts.length === 0 ? (
                    <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
                        No podcasts generated yet. Save some articles to get started!
                    </div>
                ) : (
                    podcasts.map((podcast) => (
                        <Link
                            key={podcast.id}
                            to={`/podcast/${podcast.id}`}
                            className="block group"
                        >
                            <div className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                <div className="mt-1 p-2 bg-primary/10 rounded-full text-primary">
                                    <Headphones className="w-6 h-6" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                            {podcast.title}
                                        </h3>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {new Date(podcast.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground line-clamp-2">
                                        {podcast.description || "No description available."}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
