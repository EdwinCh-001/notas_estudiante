import { LoaderCircle } from 'lucide-react';

type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = 'Verificando tu enlace…' }: LoadingStateProps) {
  return (
    <div aria-live="polite" className="flex flex-col items-center py-4 text-center" role="status">
      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background text-primary">
        <LoaderCircle aria-hidden="true" className="animate-spin" size={23} />
      </span>
      <p className="mt-4 text-sm font-medium">{label}</p>
      <p className="mt-1 text-xs text-muted">Esto solo debería tomar unos segundos.</p>
    </div>
  );
}
