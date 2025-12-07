import { createFileRoute, Link, useNavigate, redirect } from '@tanstack/react-router';
import { useState } from 'react';
import { fetchApi } from '../../lib/api';
import { useSession } from '../../lib/auth-client';
import { Copy, Check } from 'lucide-react';
import { AudioPlayer } from '../../components/AudioPlayer';

import { BookmarkletModal } from '../../components/BookmarkletModal';
import { PodcastFeedModal } from '../../components/PodcastFeedModal';

export const Route = createFileRoute('/_app/dashboard')({
    loader: async () => {
        try {
            const [userRes, podcastsRes] = await Promise.all([
                fetchApi('/api/user'),
                fetchApi('/api/podcasts'),
            ]);
            return {
                user: userRes.user as UserProfile,
                podcasts: podcastsRes.podcasts as Podcast[]
            };
        } catch (error) {
            // Check if error is 401
            if (error instanceof Error && error.message.includes('401')) {
                throw redirect({ to: '/login' });
            }
            // Allow error component to handle it or rethrow
            throw error;
        }
    },
    component: Dashboard,
});

// Types based on API responses and Prisma models
interface UserProfile {
    id: string;
    name: string | null;
    email: string;
    feedUrl: string;
    credits: number;
    podcastName: string | null;
}

interface Article {
    id: string;
    title: string;
    url: string;
    summary: string | null;
}

interface UserArticle {
    id: string;
    addedAt: string;
    article: Article;
}

interface Podcast {
    id: string;
    title: string;
    date: string;
    description: string | null;
    audioUrl: string | null;
}

function Dashboard() {
    const { user, podcasts } = Route.useLoaderData();
    const navigate = useNavigate();
    const { data: session } = useSession(); // Keep for "Welcome back, {session?.user?.name}" fallback if needed, but loader user is better.
    // const [user, setUser] = useState<UserProfile | null>(null); // Removed
    // const [podcasts, setPodcasts] = useState<Podcast[]>([]); // Removed
    const [urlInput, setUrlInput] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showBookmarkletModal, setShowBookmarkletModal] = useState(false);
    const [showPodcastModal, setShowPodcastModal] = useState(false);

    const handleGeneratePodcast = async () => {
        setIsGenerating(true);
        setError(null);
        setSuccessMessage(null);
        try {
            await fetchApi('/api/podcasts/generate-podcast', {
                method: 'POST',
            });
            setSuccessMessage("Podcast will be generated shortly");
            // Redirect to podcasts page with processing flag
            navigate({ to: '/podcasts', search: { processing: true } });
        } catch (err) {
            console.error("Failed to generate podcast", err);
            setError("Failed to generate podcast. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const recentPodcasts = podcasts.slice(0, 5);

    const feedLink = `${import.meta.env.VITE_API_URL}/feed/${user?.feedUrl}`;

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Welcome & Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Welcome back, {user?.name || session?.user?.name || 'Reader'}
                        </h1>
                        <p className="text-muted-foreground">
                            Here is what's happening with your reading list today.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content - Recent Episodes */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold tracking-tight">Recent Episodes</h2>
                        <div className="flex items-center gap-4">
                            {successMessage && <span className="text-sm text-green-600 hidden sm:inline-block animate-fadeIn">{successMessage}</span>}
                            <Link to="/podcasts" search={{ processing: undefined }} className="text-sm font-medium text-primary hover:underline">
                                View All
                            </Link>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {recentPodcasts.length === 0 ? (
                            <div className="text-center p-12 border border-dashed rounded-xl text-muted-foreground">
                                No podcasts generated yet. Save some articles and generate your first episode!
                            </div>
                        ) : (
                            recentPodcasts.map(podcast => (
                                <div key={podcast.id} className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <Link to={`/podcast/${podcast.id}`} className="font-bold text-xl hover:text-primary transition-colors">
                                                {podcast.title}
                                            </Link>
                                            <div className="text-sm text-muted-foreground">
                                                {new Date(podcast.date).toLocaleDateString(undefined, {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                        </div>
                                        <Link
                                            to={`/podcast/${podcast.id}`}
                                            className="text-sm text-muted-foreground hover:text-foreground md:text-right"
                                        >
                                            View Details &rarr;
                                        </Link>
                                    </div>

                                    {podcast.description && (
                                        <p className="text-muted-foreground line-clamp-2 text-sm">
                                            {podcast.description}
                                        </p>
                                    )}

                                    {podcast.audioUrl && (
                                        <div className="pt-2">
                                            <AudioPlayer src={podcast.audioUrl} />
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                        {recentPodcasts.length > 0 && (
                            <div className="text-center pt-4">
                                <Link to="/podcasts" search={{ processing: undefined }} className="text-sm font-medium text-primary hover:underline">
                                    View All Episodes &rarr;
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar - Quick Actions & Feed */}
                <div className="space-y-6">
                    {/* Quick Actions Card */}
                    <div className="rounded-xl border bg-card shadow-sm">
                        <div className="p-6 border-b">
                            <h3 className="font-semibold text-lg">Quick Actions</h3>
                        </div>
                        <div className="p-4 space-y-4">
                            {/* Feed URL */}
                            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-sm">Podcast Feed URL</h4>
                                    <FeedCopyButton feedUrl={feedLink} />
                                </div>
                                <p className="text-xs text-muted-foreground break-all font-mono">
                                    {feedLink}
                                </p>
                            </div>

                            <button
                                onClick={() => setShowBookmarkletModal(true)}
                                className="w-full p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-left flex items-start gap-4 group"
                            >
                                <div className="p-2 rounded-md bg-background shadow-sm text-xl group-hover:scale-110 transition-transform">
                                    📚
                                </div>
                                <div>
                                    <h4 className="font-medium">Install Save Button</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">Save articles from any page to your library.</p>
                                </div>
                            </button>

                            <button
                                onClick={handleGeneratePodcast}
                                disabled={isGenerating}
                                className="w-full p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-left flex items-start gap-4 group"
                            >
                                <div className="p-2 rounded-md bg-background shadow-sm text-xl group-hover:scale-110 transition-transform">
                                    🎙️
                                </div>
                                <div>
                                    <h4 className="font-medium">{isGenerating ? 'Generating...' : 'Generate New Episode'}</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                                        Articles will be automatically generated at the end of the day but if you want to manually create one, you can use this.
                                    </p>
                                </div>
                            </button>

                            <button
                                onClick={() => setShowPodcastModal(true)}
                                className="w-full p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-left flex items-start gap-4 group"
                            >
                                <div className="p-2 rounded-md bg-background shadow-sm text-xl group-hover:scale-110 transition-transform">
                                    🎧
                                </div>
                                <div>
                                    <h4 className="font-medium">Connect Podcast Player</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                                        Get your private Podcast feed URL to listen in your favorite app.
                                    </p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <BookmarkletModal
                isOpen={showBookmarkletModal}
                onClose={() => setShowBookmarkletModal(false)}
            />

            <PodcastFeedModal
                isOpen={showPodcastModal}
                onClose={() => setShowPodcastModal(false)}
                feedUrl={feedLink}
            />
        </div >
    );
}

function FeedCopyButton({ feedUrl }: { feedUrl: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(feedUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy feed URL', err);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className="p-1 hover:bg-muted rounded transition-colors"
            title="Copy feed URL"
        >
            {copied ? (
                <Check className="w-4 h-4 text-green-500" />
            ) : (
                <Copy className="w-4 h-4" />
            )}
        </button>
    );
}

