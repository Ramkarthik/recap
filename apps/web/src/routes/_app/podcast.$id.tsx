import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { fetchApi } from '../../lib/api';
import { ArrowLeft, Calendar, Download } from 'lucide-react';
import { AudioPlayer } from '../../components/AudioPlayer';

export const Route = createFileRoute('/_app/podcast/$id')({
    loader: async ({ params }) => {
        try {
            const res = await fetchApi(`/api/podcasts/${params.id}`);
            return { podcast: res.podcast as Podcast };
        } catch (error) {
            console.error("Failed to fetch podcast", error);
            throw error;
        }
    },
    component: PodcastDetail,
    errorComponent: ({ error }) => {
        const navigate = useNavigate();
        return (
            <div className="p-8 space-y-4">
                <div className="text-destructive">{error.message || "Failed to load podcast."}</div>
                <button onClick={() => navigate({ to: '/podcasts' })} className="text-primary hover:underline">
                    &larr; Back to Podcasts
                </button>
            </div>
        );
    }
});

interface Podcast {
    id: string;
    title: string;
    date: string;
    description: string | null;
    audioUrl: string | null;
    summary: string | null;
}

function PodcastDetail() {
    const { podcast } = Route.useLoaderData();
    // const { id } = Route.useParams();
    // const navigate = useNavigate(); // Not needed if logic moved

    // ... no useEffect ...

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <Link to="/podcasts" search={{ processing: undefined }} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Podcasts
            </Link>

            <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">{podcast.title}</h1>
                <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(podcast.date).toLocaleDateString(undefined, {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </div>
                </div>
            </div>

            {podcast.audioUrl && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">Listen Now</h3>
                        <a
                            href={podcast.audioUrl}
                            download
                            className="text-sm font-medium text-primary hover:underline inline-flex items-center"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download Episode
                        </a>
                    </div>
                    <AudioPlayer src={podcast.audioUrl} />
                </div>
            )}

            <div className="prose dark:prose-invert max-w-none">
                <h3 className="text-xl font-semibold mb-2">Description</h3>
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                    {podcast.description || "No description available."}
                </p>
            </div>
            <div className="prose dark:prose-invert max-w-none">
                <h3 className="text-xl font-semibold mb-2">Transcript</h3>
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                    {podcast.summary || "No transcript available."}
                </p>
            </div>
        </div>
    );
}
