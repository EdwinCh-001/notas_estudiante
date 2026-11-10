import { KeyRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { AuthCard } from '../components/AuthCard';
import { LoadingState } from '../components/LoadingState';
import { StatusCard } from '../components/StatusCard';
import {
  clearCallbackFromAddressBar,
  getAuthErrorMessage,
  hasValidRecoverySession,
  isExpiredAuthError,
  markRecoverySessionVerified,
  processAuthCallback,
} from '../lib/auth';
import { supabaseConfigError } from '../lib/supabase';

type ResetState =
  | { status: 'loading' }
  | { status: 'expired'; message: string }
  | { status: 'error'; message: string };

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<ResetState>({ status: 'loading' });

  useEffect(() => {
    let active = true;

    async function validateResetLink() {
      if (supabaseConfigError) {
        setState({ status: 'error', message: supabaseConfigError });
        return;
      }

      try {
        const callback = await processAuthCallback(new URL(window.location.href));
        if (callback) {
          if (callback.type !== 'recovery' || !callback.session) {
            throw new Error('El enlace no es una solicitud válida para cambiar la contraseña.');
          }
          markRecoverySessionVerified();
        } else if (!(await hasValidRecoverySession())) {
          throw new Error('El enlace de recuperación no está disponible. Solicita uno nuevo.');
        }

        clearCallbackFromAddressBar('/reset-password');
        if (active) navigate('/update-password', { replace: true });
      } catch (error) {
        clearCallbackFromAddressBar('/reset-password');
        if (active) {
          setState(
            isExpiredAuthError(error)
              ? { status: 'expired', message: getAuthErrorMessage(error) }
              : { status: 'error', message: getAuthErrorMessage(error) },
          );
        }
      }
    }

    void validateResetLink();
    return () => {
      active = false;
    };
  }, [navigate]);

  const expired = state.status === 'expired';

  return (
    <AuthCard
      description="Estamos validando de forma segura tu solicitud para cambiar la contraseña."
      eyebrow="RECUPERACIÓN DE CUENTA"
      icon={<KeyRound aria-hidden="true" size={21} />}
      title={expired ? 'El enlace ha caducado' : state.status === 'error' ? 'No pudimos validar el enlace' : 'Verificando tu solicitud'}
    >
      {state.status === 'loading' ? <LoadingState /> : null}
      {state.status === 'expired' || state.status === 'error' ? (
        <>
          <StatusCard
            message={state.message}
            title={expired ? 'Solicita un enlace nuevo' : 'No se inició el cambio'}
            variant={expired ? 'warning' : 'error'}
          />
          <Link
            className="mt-5 flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_8px_24px_-12px_var(--primary)] transition hover:-translate-y-0.5 hover:brightness-105"
            to="/"
          >
            Solicitar otro enlace
          </Link>
        </>
      ) : null}
    </AuthCard>
  );
}
