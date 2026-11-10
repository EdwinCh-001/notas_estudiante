import type { ButtonHTMLAttributes, ReactNode } from 'react';

type SecondaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function SecondaryButton({
  children,
  className = '',
  ...props
}: SecondaryButtonProps) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card/70 px-4 text-sm font-medium text-foreground transition hover:bg-background ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
