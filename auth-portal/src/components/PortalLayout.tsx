import { useEffect, useState, type PropsWithChildren } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

import { AuthHeader } from './AuthHeader';
import { FlowLinesBackground } from './FlowLinesBackground';

type ThemeMode = 'light' | 'dark';

function getInitialTheme(): ThemeMode {
  try {
    const stored = window.localStorage.getItem('auth-portal.theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // Continue with the device theme if browser storage is unavailable.
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function PortalLayout({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      window.localStorage.setItem('auth-portal.theme', theme);
    } catch {
      // Theme selection still works for the current page.
    }
  }, [theme]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
      <FlowLinesBackground />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1120px] flex-col px-5 sm:px-8">
        <div className="pt-5 sm:pt-8">
          <AuthHeader
            dark={theme === 'dark'}
            onToggleTheme={() =>
              setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
            }
          />
        </div>

        <main className="flex flex-1 items-center justify-center py-10 sm:py-14">
          <motion.div
            animate={{ opacity: 1 }}
            className="w-full max-w-[470px]"
            key={location.pathname}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </main>

        <footer className="flex flex-col items-center justify-between gap-3 border-t border-border/70 py-5 text-xs text-muted sm:flex-row">
          <span>© {new Date().getFullYear()} Student Notes</span>
          <div className="flex items-center gap-5">
            <Link className="transition hover:text-foreground" to="/">
              Centro de ayuda
            </Link>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Conexión segura
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
