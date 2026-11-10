import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';

type StatusCardProps = {
  title: string;
  message: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  action?: ReactNode;
};

const styles = {
  success: {
    className: 'border-emerald-500/20 bg-emerald-500/[.07] text-success',
    Icon: CheckCircle2,
  },
  error: {
    className: 'border-rose-500/20 bg-rose-500/[.07] text-danger',
    Icon: XCircle,
  },
  warning: {
    className: 'border-amber-500/20 bg-amber-500/[.07] text-warning',
    Icon: AlertCircle,
  },
  info: {
    className: 'border-primary/20 bg-primary/[.07] text-primary',
    Icon: Info,
  },
};

export function StatusCard({
  title,
  message,
  variant = 'info',
  action,
}: StatusCardProps) {
  const { className, Icon } = styles[variant];

  return (
    <div aria-live="polite" className={`rounded-2xl border p-4 ${className}`} role="status">
      <div className="flex items-start gap-3">
        <Icon aria-hidden="true" className="mt-0.5 shrink-0" size={18} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-sm leading-5 text-muted">{message}</p>
          {action ? <div className="mt-3">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}
