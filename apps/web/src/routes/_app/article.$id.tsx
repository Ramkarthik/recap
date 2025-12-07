import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { fetchApi } from '../../lib/api';
import { ArrowLeft, ExternalLink, Calendar, FileText } from 'lucide-react';

export const Route = createFileRoute('/_app/article/$id')({
    loader: async ({ params }) => {
        try {
            const res = await fetchApi(`/api/articles/${params.id}`);
            return { userArticle: res.article as UserArticle };
        } catch (error) {
            console.error("Failed to fetch article", error);
            throw error;
        }
    },
    component: ArticleDetail,
    errorComponent: ({ error }) => {
        const navigate = useNavigate();
        return (
            <div className="p-8 space-y-4">
                <div className="text-destructive">{error.message || "Failed to load article."}</div>
                <button onClick={() => navigate({ to: '/articles' })} className="text-primary hover:underline">
                    &larr; Back to Articles
                </button>
            </div>
        );
    }
});

interface Article {
    id: string;
    title: string;
    url: string;
    content: { content: string | null } | null;
    summary: string | null;
}

interface UserArticle {
    id: string;
    addedAt: string;
    article: Article;
}

function ArticleDetail() {
    const { userArticle } = Route.useLoaderData();
    const { article } = userArticle;

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <Link to="/articles" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Articles
            </Link>

            <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">{article.title}</h1>
                <div className="flex items-center gap-4 text-muted-foreground text-sm">
                    <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center hover:text-primary transition-colors"
                    >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        {new URL(article.url).hostname}
                    </a>
                    <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(userArticle.addedAt).toLocaleDateString()}
                    </div>
                </div>
            </div>

            {article.summary && (
                <div className="rounded-xl border bg-card p-6 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 font-semibold text-lg">
                        <FileText className="w-5 h-5" />
                        <h3>Summary</h3>
                    </div>
                    <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                        {article.summary}
                    </p>
                </div>
            )}

            {/* {article.content && (
                <div className="prose dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                        {article.content.content}
                    </p>
                </div>
            )} */}
        </div>
    )
}
