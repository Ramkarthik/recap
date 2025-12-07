import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useEffect } from 'react';

export const Route = createFileRoute('/_app/save/$title/$url')({
    loader: async ({ params }) => {
        const { title, url } = params;
        const decodedUrl = decodeURIComponent(url);
        const decodedTitle = decodeURIComponent(title);

        console.log("Saving article via loader...");

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/articles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Important for cookies/auth
            body: JSON.stringify({
                url: decodedUrl,
                title: decodedTitle,
            }),
        });

        if (!response.ok) {
            // Check for auth error if needed, though _app usually handles it.
            // If we are here, something went wrong.
            if (response.status === 401) {
                throw redirect({
                    to: '/login',
                    search: {
                        // Reconstruct the path for redirect
                        redirect: `/save/${title}/${url}`
                    }
                });
            }
            throw new Error('Failed to save article');
        }

        return { success: true, title: decodedTitle };
    },
    pendingComponent: () => (
        <div className="flex h-[80vh] flex-col items-center justify-center p-4 text-center">
            <div className="max-w-md space-y-6 rounded-xl border bg-card p-8 shadow-lg">
                <div className="flex justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-bold">Saving Article...</h2>
                </div>
            </div>
        </div>
    ),
    errorComponent: () => {
        // We can hook into useRouteError if we want specific error details
        const navigate = useNavigate();
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center p-4 text-center">
                <div className="max-w-md space-y-6 rounded-xl border bg-card p-8 shadow-lg">
                    <div className="flex justify-center">
                        <XCircle className="h-12 w-12 text-destructive" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold">Something went wrong</h2>
                        <p className="text-sm text-destructive">Failed to save article. Please try again.</p>
                    </div>
                    <button
                        onClick={() => navigate({ to: '/dashboard' })}
                        className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    },
    component: SaveArticle,
});

function SaveArticle() {
    const { title } = Route.useLoaderData();
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate({ to: '/dashboard' });
        }, 1500);
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="flex h-[80vh] flex-col items-center justify-center p-4 text-center">
            <div className="max-w-md space-y-6 rounded-xl border bg-card p-8 shadow-lg">
                <div className="flex justify-center">
                    <CheckCircle className="h-12 w-12 text-green-500" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-xl font-bold">Article Saved!</h2>
                    <p className="text-muted-foreground break-all">
                        {title}
                    </p>
                </div>

                <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
            </div>
        </div>
    );
}
