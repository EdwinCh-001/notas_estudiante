import { Moon, NotebookPen, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';

type AuthHeaderProps = {
  dark: boolean;
  onToggleTheme: () => void;
};

export function AuthHeader({ dark, onToggleTheme }: AuthHeaderProps) {
  return (
    <header className="flex items-center justify-between">
      <Link aria-label="Student Notes, inicio" className="group flex items-center gap-3" to="/">
        <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-foreground text-background shadow-lg shadow-slate-950/10 transition-transform group-hover:-rotate-3">
          <NotebookPen aria-hidden="true" size={19} strokeWidth={1.8} />
        </span>
        <span className="text-[15px] font-semibold tracking-[-0.03em]">Student Notes</span>
      </Link>

      <div className="flex items-center gap-2">
        <button
          aria-label={dark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/70 text-muted shadow-sm transition hover:text-foreground"
          onClick={onToggleTheme}
          type="button"
        >
          {dark ? <Sun aria-hidden="true" size={17} /> : <Moon aria-hidden="true" size={17} />}
        </button>
      </div>
    </header>
  );
}
