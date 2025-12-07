import { createFileRoute, Link, Outlet, useNavigate } from '@tanstack/react-router';
import { useSession, signOut } from '../lib/auth-client';
import { useRef, useEffect, useState } from 'react';
import {
    LayoutDashboard,
    FileText,
    Headphones,
    LogOut,
    User,
    ChevronsUpDown,
    PanelLeftClose,
    PanelLeftOpen,
    Menu,
    X
} from 'lucide-react';


export const Route = createFileRoute('/_app')({
    component: AppLayout,
});

function AppLayout() {
    const { data: session, isPending, error } = useSession();
    const navigate = useNavigate();
    const [showLogout, setShowLogout] = useState(false);
    const logoutRef = useRef<HTMLDivElement>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await signOut();
            navigate({ to: '/' });
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
            {/* Desktop Sidebar */}
            <aside
                className={`border-r bg-card p-4 hidden md:flex md:flex-col shrink-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'
                    }`}
            >


                {/* Refined Sidebar Header for Collapse logic */}
                <div className="mb-6 flex items-center justify-between">
                    <div className={`flex items-center gap-2 overflow-hidden transition-all ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                        <img src="/logo.png" alt="Recap Logo" className="h-8 w-8 rounded shrink-0" />
                        <span className="text-xl font-bold whitespace-nowrap">Recap</span>
                    </div>
                    <div className={`${isCollapsed ? 'mx-auto' : ''}`}>
                        {isCollapsed && <img src="/logo.png" alt="Recap Logo" className="h-8 w-8 rounded mb-4" />}
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <nav className="space-y-2 flex-1">
                    <NavLink to="/dashboard" label="Dashboard" icon={<LayoutDashboard className="h-5 w-5" />} isCollapsed={isCollapsed} />
                    <NavLink to="/articles" label="Articles" icon={<FileText className="h-5 w-5" />} isCollapsed={isCollapsed} />
                    <NavLink to="/podcasts" label="Podcasts" icon={<Headphones className="h-5 w-5" />} isCollapsed={isCollapsed} />
                </nav>

                {/* User Profile Section */}
                <div className={`relative pt-4 border-t mt-auto transition-all ${isCollapsed ? 'items-center' : ''}`} ref={logoutRef}>
                    {showLogout && (
                        <div className={`absolute bottom-full left-0 mb-2 rounded-lg border bg-popover p-1 shadow-md animate-in slide-in-from-bottom-2 fade-in duration-200 ${isCollapsed ? 'w-48 left-full ml-2' : 'w-full'}`}>
                            <button
                                onClick={() => handleLogout()}
                                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                Log out
                            </button>
                        </div>
                    )}

                    <button
                        onClick={() => setShowLogout(!showLogout)}
                        className={`flex items-center gap-3 rounded-lg p-2 text-left text-sm font-medium hover:bg-accent transition-colors ${isCollapsed ? 'w-auto justify-center' : 'w-full'}`}
                    >
                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                            {session?.user?.image ? (
                                <img src={session.user.image} alt={session.user.name || "User"} className="h-full w-full object-cover" />
                            ) : (
                                <User className="h-4 w-4 text-muted-foreground" />
                            )}
                        </div>
                        {!isCollapsed && (
                            <>
                                <div className="flex-1 overflow-hidden transition-all duration-300">
                                    <p className="truncate font-medium">{session?.user?.name || 'User'}</p>
                                    <p className="truncate text-xs text-muted-foreground">{session?.user?.email}</p>
                                </div>
                                <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
                            </>
                        )}
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
                    <div className="absolute left-0 top-0 h-full w-72 bg-card p-4 shadow-xl animate-in slide-in-from-left duration-200 flex flex-col">
                        <div className="flex items-center justify-between mb-8 px-2">
                            <div className="flex items-center gap-2">
                                <img src="/logo.png" alt="Recap Logo" className="h-8 w-8 rounded" />
                                <span className="text-xl font-bold">Recap</span>
                            </div>
                            <button onClick={() => setIsMobileOpen(false)} className="p-2 rounded-md hover:bg-accent">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <nav className="space-y-2 flex-1">
                            <NavLink to="/dashboard" label="Dashboard" icon={<LayoutDashboard className="h-5 w-5" />} onClick={() => setIsMobileOpen(false)} />
                            <NavLink to="/articles" label="Articles" icon={<FileText className="h-5 w-5" />} onClick={() => setIsMobileOpen(false)} />
                            <NavLink to="/podcasts" label="Podcasts" icon={<Headphones className="h-5 w-5" />} onClick={() => setIsMobileOpen(false)} />
                        </nav>

                        <div className="pt-4 border-t mt-auto">
                            <button
                                onClick={() => handleLogout()}
                                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm font-medium hover:bg-accent transition-colors text-destructive"
                            >
                                <LogOut className="h-5 w-5" />
                                <span>Log out</span>
                            </button>

                            <div className="flex items-center gap-3 mt-4 px-2 py-2">
                                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                                    {session?.user?.image ? (
                                        <img src={session.user.image} alt={session.user.name || "User"} className="h-full w-full object-cover" />
                                    ) : (
                                        <User className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="truncate font-medium">{session?.user?.name || 'User'}</p>
                                    <p className="truncate text-xs text-muted-foreground">{session?.user?.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-auto transition-all duration-300">
                <header className="flex h-16 items-center border-b px-4 gap-4 md:hidden bg-background sticky top-0 z-40">
                    <button onClick={() => setIsMobileOpen(true)} className="p-2 -ml-2 rounded-md hover:bg-accent">
                        <Menu className="h-5 w-5" />
                    </button>
                    <span className="font-bold text-lg">Recap</span>
                </header>
                <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

function NavLink({ to, label, icon, isCollapsed, onClick }: { to: string; label: string; icon: React.ReactNode; isCollapsed?: boolean; onClick?: () => void }) {
    return (
        <Link
            to={to}
            onClick={onClick}
            className={`flex items-center gap-3 rounded-md py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground [&.active]:bg-primary/10 [&.active]:text-primary ${isCollapsed ? 'justify-center px-2' : 'px-4'
                }`}
            title={isCollapsed ? label : undefined}
        >
            {icon}
            {!isCollapsed && <span className="animate-in fade-in duration-200">{label}</span>}
        </Link>
    );
}
