import { CheckCircle2, MailCheck, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthCard } from '../components/AuthCard';
import { LoadingState } from '../components/LoadingState';
import { StatusCard } from '../components/StatusCard';
import {
  clearCallbackFromAddressBar,
  getAuthErrorMessage,
  isExpiredAuthError,
  processAuthCallback,
} from '../lib/auth';
import { supabaseConfigError } from '../lib/supabase';

type VerificationState =
  | { status: 'loading' }
  | { status: 'success' }
  | { status: 'expired'; message: string }
  | { status: 'error'; message: string };

export default function VerifyEmailPage() {
  const [state, setState] = useState<VerificationState>({ status: 'loading' });

  useEffect(() => {
    let active = true;

    async function verify() {
      if (supabaseConfigError) {
        setState({ status: 'error', message: supabaseConfigError });
        return;
      }

      try {
        const callback = await processAuthCallback(new URL(window.location.href));
        if (!callback) {
          throw new Error('El enlace no contiene datos de verificación.');
        }
        if (
          callback.type &&
          !['email', 'signup', 'email_change'].includes(callback.type)
        ) {
          throw new Error('Este enlace no es para confirmar un correo.');
        }

        clearCallbackFromAddressBar('/verify-email');
        if (active) setState({ status: 'success' });
      } catch (error) {
        clearCallbackFromAddressBar('/verify-email');
        if (active) {
          setState(
            isExpiredAuthError(error)
              ? { status: 'expired', message: getAuthErrorMessage(error) }
              : { status: 'error', message: getAuthErrorMessage(error) },
          );
        }
      }
    }

    void verify();
    return () => {
      active = false;
    };
  }, []);

  const success = state.status === 'success';
  const expired = state.status === 'expired';

  return (
    <AuthCard
      description={
        success
          ? 'Tu correo quedó verificado y tu cuenta está lista para usarse.'
          : 'Estamos comprobando el enlace de confirmación de tu correo.'
      }
      eyebrow="VERIFICACIÓN DE CORREO"
      icon={
        success ? (
          <CheckCircle2 aria-hidden="true" className="text-success" size={21} />
        ) : expired || state.status === 'error' ? (
          <XCircle aria-hidden="true" className="text-danger" size={21} />
        ) : (
          <MailCheck aria-hidden="true" size={21} />
        )
      }
      title={success ? 'Correo confirmado' : expired ? 'El enlace ha caducado' : state.status === 'error' ? 'No pudimos verificarlo' : 'Un momento…'}
    >
      {state.status === 'loading' ? <LoadingState /> : null}
      {state.status === 'success' ? (
        <>
          <StatusCard
            message="Ya puedes volver a Student Notes e iniciar sesión con tu correo."
            title="Verificación completada"
            variant="success"
          />
          <Link
            className="mt-5 flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_8px_24px_-12px_var(--primary)] transition hover:-translate-y-0.5 hover:brightness-105"
            to="/"
          >
            Volver al portal
          </Link>
        </>
      ) : null}
      {state.status === 'expired' || state.status === 'error' ? (
        <>
          <StatusCard
            message={state.message}
            title={expired ? 'Solicita un enlace nuevo desde Student Notes' : 'Revisa el enlace'}
            variant={expired ? 'warning' : 'error'}
          />
          <Link
            className="mt-5 flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_8px_24px_-12px_var(--primary)] transition hover:-translate-y-0.5 hover:brightness-105"
            to="/"
          >
            Volver al inicio
          </Link>
        </>
      ) : null}
    </AuthCard>
  );
}
