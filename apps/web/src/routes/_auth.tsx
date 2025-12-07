import { createFileRoute, Link, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth')({
    component: AuthLayout,
});

function AuthLayout() {
    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <header className="sticky top-0 z-50 w-full border-b backdrop-blur">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <Link to="/" className="flex items-center gap-2">
                        <img src="/logo.png" alt="Recap Logo" className="h-24 w-24 rounded-lg" />
                    </Link>
                    <nav className="flex items-center gap-4">
                        <Link
                            to="/login"
                            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            Get Started
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="flex-1 flex flex-col">
                <Outlet />
            </main>

            <footer className="border-t py-6 mx-auto">
                <div className="container">
                    {/* <div className="">
                        <div className="mb-4 flex items-center gap-2">
                            <img src="/logo.png" alt="Recap Logo" className="h-6 w-6 rounded" />
                            <span className="font-bold">Recap</span>
                        </div>
                        <p className="max-w-xs text-sm text-muted-foreground">
                            Transform your reading list into a personalized podcast. Listen to the web, on your terms.
                        </p>
                    </div> */}
                    {/* <div>
                        <h3 className="mb-4 text-sm font-semibold">Product</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-foreground">Features</a></li>
                            <li><a href="#" className="hover:text-foreground">Pricing</a></li>
                            <li><a href="#" className="hover:text-foreground">Extension</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="mb-4 text-sm font-semibold">Company</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-foreground">About</a></li>
                            <li><a href="#" className="hover:text-foreground">Blog</a></li>
                            <li><a href="#" className="hover:text-foreground">Open Source</a></li>
                        </ul>
                    </div> */}
                </div>
                <div className="container mx-auto mt-12 px-4 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Recap. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
