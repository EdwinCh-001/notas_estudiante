import { LoaderCircle } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  children: ReactNode;
};

export function PrimaryButton({
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_8px_24px_-12px_var(--primary)] transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0 ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <LoaderCircle aria-hidden="true" className="animate-spin" size={17} /> : null}
      {children}
    </button>
  );
}
