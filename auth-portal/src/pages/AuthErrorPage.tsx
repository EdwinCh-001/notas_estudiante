import { CircleAlert } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { AuthCard } from '../components/AuthCard';
import { StatusCard } from '../components/StatusCard';
import { getAuthErrorMessage, isExpiredAuthError } from '../lib/auth';

export default function AuthErrorPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const navigationState = location.state;
  const stateMessage =
    typeof navigationState === 'object' &&
    navigationState !== null &&
    'message' in navigationState &&
    typeof navigationState.message === 'string'
      ? navigationState.message
      : null;
  const stateExpired =
    typeof navigationState === 'object' &&
    navigationState !== null &&
    'expired' in navigationState &&
    typeof navigationState.expired === 'boolean'
      ? navigationState.expired
      : null;
  const rawError =
    params.get('error_description') ?? params.get('error') ?? params.get('message');
  const error = rawError ? new Error(rawError) : null;
  const expired = stateExpired ?? (error ? isExpiredAuthError(error) : false);
  const message =
    stateMessage ??
    (error
      ? getAuthErrorMessage(error)
      : 'La solicitud no pudo completarse. Vuelve al portal para iniciar un nuevo flujo.');

  return (
    <AuthCard
      description="No pudimos confirmar que la solicitud de autenticación se completara correctamente."
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
