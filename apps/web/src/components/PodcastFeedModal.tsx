import { useState } from 'react';
import { X, Copy, Check, Smartphone, Headphones, Rss } from 'lucide-react';

interface PodcastFeedModalProps {
    isOpen: boolean;
    onClose: () => void;
    feedUrl: string;
}

export function PodcastFeedModal({ isOpen, onClose, feedUrl }: PodcastFeedModalProps) {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(feedUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy feed URL', err);
        }
    };

    // Helper to strip protocol for some schemes
    const feedUrlNoProtocol = feedUrl.replace(/^https?:\/\//, '');

    const providers = [
        {
            name: 'Apple Podcasts',
            icon: <Headphones className="w-5 h-5 text-purple-500" />,
            url: `podcast://${feedUrlNoProtocol}`,
            description: 'Opens Apple Podcasts'
        },
        {
            name: 'Overcast',
            icon: <div className="w-5 h-5 text-orange-500 font-bold flex items-center justify-center border border-orange-500 rounded-sm text-[10px]">O</div>, // Placeholder icon
            url: `overcast://x-callback-url/add?url=${encodeURIComponent(feedUrl)}`,
            description: 'Opens Overcast'
        },
        {
            name: 'Pocket Casts',
            icon: <div className="w-5 h-5 text-red-500 font-bold flex items-center justify-center border border-red-500 rounded-full text-[10px]">P</div>, // Placeholder icon
            url: `pktc://subscribe/${feedUrlNoProtocol}`,
            description: 'Opens Pocket Casts'
        },
        {
            name: 'Generic RSS',
            icon: <Rss className="w-5 h-5 text-orange-400" />,
            url: `feed://${feedUrlNoProtocol}`,
            description: 'Opens default RSS reader'
        }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg rounded-2xl bg-background p-8 shadow-lg animate-in zoom-in-95 duration-200 border border-border">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-bold mb-2 text-foreground">
                    Connect Podcast Player
                </h2>
                <p className="mb-6 text-muted-foreground text-sm">
                    Copy your private feed URL or open it directly in your favorite podcast app.
                </p>

                {/* Feed URL Copy Area */}
                <div className="mb-8">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                        Your Private RSS Feed
                    </label>
                    <div className="flex gap-2">
                        <div className="flex-1 bg-muted rounded-lg px-3 py-2 border flex items-center overflow-hidden">
                            <code className="text-sm font-mono whitespace-nowrap overflow-x-auto no-scrollbar flex-1 text-foreground">
                                {feedUrl}
                            </code>
                        </div>
                        <button
                            onClick={handleCopy}
                            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 min-w-[100px] justify-center"
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                </div>

                {/* Podcast Providers */}
                <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
                        Open Directly In...
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                        {providers.map((provider) => (
                            <a
                                key={provider.name}
                                href={provider.url}
                                className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-accent hover:border-primary/50 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-background border flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                                    {provider.icon}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-foreground">{provider.name}</h4>
                                    <p className="text-xs text-muted-foreground">{provider.description}</p>
                                </div>
                                <Smartphone className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
