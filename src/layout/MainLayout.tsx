// src/layout/MainLayout.tsx
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import clsx from "clsx"
import { useAppContext } from '@/context/AppContext';
import { Button } from "@/components/ui/button";

// --- Icons for the navigation links ---
const CodeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>;
const BugIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="17" x2="12" y2="22"></line><path d="M12 17h.01"></path><path d="M15 14h.01"></path><path d="M9 14h.01"></path><path d="M17 10h.01"></path><path d="M7 10h.01"></path><path d="M20 17.8a9.9 9.9 0 0 1-8 2.2 9.9 9.9 0 0 1-8-2.2"></path><path d="M4 12a8 8 0 0 1 16 0Z"></path><path d="M15 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"></path><path d="M9 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"></path></svg>;
const MousePointerClickIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path><path d="M13 13l6 6"></path></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"></path></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2A.75.75 0 0010.75 3.5h-5.5A.75.75 0 004.5 4.25v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" /><path fillRule="evenodd" d="M16.72 9.22a.75.75 0 011.06 0l2.25 2.25a.75.75 0 010 1.06l-2.25 2.25a.75.75 0 11-1.06-1.06L17.94 12l-1.22-1.22a.75.75 0 010-1.06z" clipRule="evenodd" /></svg>;


export default function MainLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, authUser, setAuthUser, setAuthToken, setIsLoggedIn } = useAppContext();

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAuthToken(null);
    setAuthUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    navigate('/login');
  };

  const mainNavItems = [
    { name: "CodeSolve", path: "/", icon: <CodeIcon /> },
    { name: "DebugZone", path: "/debug", icon: <BugIcon /> },
    { name: "Click-to-Code", path: "/click-to-code", icon: <MousePointerClickIcon /> },
    { name: "AI Assistant", path: "/ai-assistant", icon: <SparklesIcon /> }
  ];

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-gray-900">
      {/* --- Redesigned Sidebar --- */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-2xl flex-shrink-0">
        <div className="text-3xl font-black text-white p-6 border-b border-slate-700/50">
            {/* --- NEW: Animated Logo --- */}
            <div className="group flex justify-center cursor-pointer">
                {'CodeZone'.split('').map((char, index) => (
                    <span
                        key={index}
                        className="transition-all duration-300 group-hover:text-purple-400 group-hover:-translate-y-1"
                        style={{ transitionDelay: `${index * 50}ms` }}
                    >
                        {char}
                    </span>
                ))}
            </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {isLoggedIn && mainNavItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={clsx(
                "flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 text-base font-semibold relative",
                pathname === item.path
                  ? "bg-purple-600/20 text-purple-300"
                  // ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              )}
            >
              {/* --- Active link indicator bar --- */}
              <div className={clsx(
                  "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-purple-500 rounded-r-full transition-all duration-300",
                  pathname === item.path ? "opacity-100" : "opacity-0"
              )}></div>
              <div className={clsx(pathname === item.path ? "text-purple-400" : "text-slate-500")}>{item.icon}</div>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* --- User Profile & Logout Footer --- */}
        <footer className="p-4 mt-auto border-t border-slate-700/50 space-y-4">
            {isLoggedIn && authUser && (
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center font-bold text-white text-lg flex-shrink-0">
                        {authUser.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                        <p className="font-semibold text-white truncate">{authUser.username}</p>
                        <p className="text-xs text-slate-400 truncate">{authUser.email}</p>
                    </div>
                </div>
            )}
             <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-center text-slate-400 hover:bg-red-500/20 hover:text-red-300 flex items-center gap-2 text-base"
            >
              <LogoutIcon />
              <span>Logout</span>
            </Button>
        </footer>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 overflow-y-auto">
          <Outlet />
      </main>
    </div>
  );
}
