import { useRef, useState } from 'react';
import { X, Copy, Check } from 'lucide-react';

interface BookmarkletModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function BookmarkletModal({ isOpen, onClose }: BookmarkletModalProps) {
    const bookmarkletRef = useRef<HTMLAnchorElement>(null);
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const bookmarkletCode = `javascript:(function(){var url=encodeURIComponent(window.location.href);var title=encodeURIComponent(document.title);window.open('${import.meta.env.VITE_APP_URL}/save?url='+url+'&title='+title,'_blank','width=500,height=400');})();`;
    //const bookmarkletCode = `javascript:(function(){var url=encodeURIComponent(window.location.href);var title=encodeURIComponent(document.title);var content='';var article=document.querySelector('article')||document.querySelector('[role="main"]')||document.querySelector('main')||document.body;if(article){var clone=article.cloneNode(true);var scripts=clone.querySelectorAll('script,style,nav,header,footer,aside');scripts.forEach(function(el){el.remove()});content=encodeURIComponent(clone.innerText.trim().substring(0,50000));}window.open('${import.meta.env.VITE_APP_URL}/save?url='+url+'&title='+title+'&content='+content,'_blank','width=500,height=400');})();`;

    const copyBookmarklet = () => {
        navigator.clipboard.writeText(bookmarkletCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        alert('Bookmarklet code copied! You can manually create a bookmark with this code.');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl rounded-2xl bg-background p-8 shadow-lg animate-in zoom-in-95 duration-200 border border-border">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-bold mb-4 text-foreground">
                    Save Articles Easily
                </h2>
                <p className="mb-6 text-muted-foreground">
                    Drag this button to your bookmarks bar, then click it on any article to save it to Recap:
                </p>

                <div className="flex gap-4 items-center mb-6">
                    <a
                        ref={bookmarkletRef}
                        href="#"
                        className="px-6 py-3 rounded-lg font-medium inline-block cursor-move select-none bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        draggable="true"
                        onDragStart={(e) => {
                            e.dataTransfer.setData('text/uri-list', bookmarkletCode);
                            e.dataTransfer.setData('text/plain', bookmarkletCode);
                        }}
                        onClick={(e) => {
                            e.preventDefault();
                            alert('Drag this button to your bookmarks bar to install!');
                        }}
                    >
                        📚 Save to Recap
                    </a>
                    <button
                        onClick={copyBookmarklet}
                        className="px-6 py-3 rounded-lg font-medium border bg-card hover:bg-accent transition-colors flex items-center gap-2"
                    >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied' : 'Copy Code'}
                    </button>
                </div>

                <div className="p-4 rounded-lg mb-6 bg-muted/50 border">
                    <p className="text-sm mb-2 text-foreground font-medium">
                        How to install:
                    </p>
                    <ol className="text-sm space-y-2 text-muted-foreground">
                        <li>1. Make sure your bookmarks bar is visible (Ctrl+Shift+B or Cmd+Shift+B)</li>
                        <li>2. Drag the "Save to Recap" button above to your bookmarks bar</li>
                        <li>3. Click it on any article page to save it to Recap</li>
                    </ol>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 border">
                    <p className="text-sm mb-2 font-medium text-foreground">
                        Manual Installation:
                    </p>
                    <p className="text-sm mb-2 text-muted-foreground">
                        If dragging doesn't work, you can manually create a bookmark:
                    </p>
                    <ol className="text-sm space-y-2 mb-3 text-muted-foreground">
                        <li>1. Click "Copy Code" above</li>
                        <li>2. Create a new bookmark (Ctrl+D or Cmd+D)</li>
                        <li>3. Name it "Save to Recap"</li>
                        <li>4. Paste the copied code as the URL</li>
                    </ol>
                    <code className="block p-3 rounded text-xs overflow-x-auto bg-background border text-muted-foreground font-mono">
                        {bookmarkletCode}
                    </code>
                </div>
            </div>
        </div>
    );
}
