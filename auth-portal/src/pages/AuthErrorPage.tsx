import { CircleAlert } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { AuthCard } from '../components/AuthCard';
import { StatusCard } from '../components/StatusCard';
import { getAuthErrorMessage, isExpiredAuthError } from '../lib/auth';

export default function AuthErrorPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const rawError =
    params.get('error_description') ?? params.get('error') ?? params.get('message');
  const error = rawError ? new Error(rawError) : null;
  const expired = error ? isExpiredAuthError(error) : false;
  const message = error
    ? getAuthErrorMessage(error)
    : 'La solicitud no pudo completarse. Vuelve al portal para iniciar un nuevo flujo.';

  return (
    <AuthCard
      description="Tu seguridad es lo primero. No se realizaron cambios en la cuenta."
      eyebrow="NO SE PUDO COMPLETAR"
      icon={<CircleAlert aria-hidden="true" className="text-danger" size={21} />}
      title={expired ? 'El enlace ha caducado' : 'Algo salió mal'}
    >
      <StatusCard
        message={message}
        title={expired ? 'Solicita uno nuevo' : 'Inténtalo otra vez'}
        variant={expired ? 'warning' : 'error'}
      />
      <Link
        className="mt-5 flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_8px_24px_-12px_var(--primary)] transition hover:-translate-y-0.5 hover:brightness-105"
        to="/"
      >
        Volver al portal
      </Link>
    </AuthCard>
  );
}
