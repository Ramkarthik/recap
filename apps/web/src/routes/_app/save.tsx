import { createFileRoute, redirect } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createFileRoute('/_app/save')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      url: search.url as string,
      title: search.title as string,
      content: search.content as string | undefined,
    };
  },
  loader: async ({ location }) => {
    const search = location.search as { url: string; title: string; content?: string };
    const { url, title, content } = search;

    if (!url || !title) {
      throw new Error("Missing url or title");
    }

    console.log("Saving article via loader...");

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ url, title, content }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw redirect({
          to: '/login',
          search: {
            redirect: `/save?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}${content ? `&content=${encodeURIComponent(content)}` : ''}`
          },
        });
      }
      throw new Error('Failed to save article');
    }

    return { success: true };
  },
  pendingComponent: () => (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="text-center p-8 rounded-2xl max-w-md" style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)'
      }}>
        <div className="text-4xl mb-4">⏳</div>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Saving Article
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>Saving article...</p>
      </div>
    </div>
  ),
  errorComponent: () => (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="text-center p-8 rounded-2xl max-w-md" style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)'
      }}>
        <div className="text-4xl mb-4">❌</div>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-error)' }}>
          Error
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>Failed to save article. Please try again.</p>
        <button
          onClick={() => window.close()}
          className="mt-6 px-6 py-2 rounded-lg"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'white'
          }}
        >
          Close
        </button>
      </div>
    </div>
  ),
  component: SaveArticle,
});

function SaveArticle() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.close();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="text-center p-8 rounded-2xl max-w-md" style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)'
      }}>
        <div className="text-4xl mb-4">✅</div>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-success)' }}>
          Article Saved!
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>Article saved successfully!</p>
        <p className="text-sm mt-4" style={{ color: 'var(--color-text-muted)' }}>
          This window will close automatically...
        </p>
      </div>
    </div>
  );
}