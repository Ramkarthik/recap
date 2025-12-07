import { createFileRoute, Link } from '@tanstack/react-router';
import { fetchApi } from '../../../lib/api';
import { FileText, ExternalLink, Clock } from 'lucide-react';

export const Route = createFileRoute('/_app/articles/')({
    loader: async () => {
        try {
            const res = await fetchApi('/api/articles');
            return { articles: res.articles as UserArticle[] };
        } catch (error) {
            console.error("Failed to fetch articles", error);
            throw error;
        }
    },
    component: ArticleList,
});

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

function ArticleList() {
    const { articles } = Route.useLoaderData();
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight">Saved Articles</h1>
            <div className="grid gap-4">
                {articles.length === 0 ? (
                    <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
                        No articles saved yet.
                    </div>
                ) : (
                    articles.map((item) => (
                        <div key={item.id} className="block group">
                            <div className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                <Link to={`/article/${item.article.id}`} className="mt-1 p-2 bg-primary/10 rounded-full text-primary hover:bg-primary/20 transition-colors">
                                    <FileText className="w-6 h-6" />
                                </Link>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-start justify-between gap-4">
                                        <Link to={`/article/${item.article.id}`} className="font-semibold text-lg group-hover:text-primary transition-colors hover:underline">
                                            {item.article.title}
                                        </Link>
                                        <div className="flex items-center text-sm text-muted-foreground whitespace-nowrap">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {new Date(item.addedAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                    {item.article.summary && (
                                        <p className="text-muted-foreground line-clamp-2">
                                            {item.article.summary}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-2 pt-1">
                                        <a
                                            href={item.article.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs flex items-center text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            <ExternalLink className="w-3 h-3 mr-1" />
                                            {new URL(item.article.url).hostname}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
