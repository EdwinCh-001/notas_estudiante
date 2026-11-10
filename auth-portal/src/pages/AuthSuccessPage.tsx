import { CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthCard } from '../components/AuthCard';
import { LoadingState } from '../components/LoadingState';
import { StatusCard } from '../components/StatusCard';
import {
  clearCallbackFromAddressBar,
  getAuthErrorMessage,
  processAuthCallback,
} from '../lib/auth';

type SuccessState = 'loading' | 'success' | 'error';

export default function AuthSuccessPage() {
  const [state, setState] = useState<SuccessState>('loading');
  const [message, setMessage] = useState('');
  const reason = new URLSearchParams(window.location.search).get('reason');
  const title =
    reason === 'password-updated'
      ? 'Contraseña actualizada'
      : 'Autenticación completada';

  useEffect(() => {
    let active = true;
    const url = new URL(window.location.href);
    const callbackParams = [
      'code',
      'access_token',
      'token_hash',
      'error',
      'error_description',
    ];
    const hasCallback = callbackParams.some(
      (key) => url.searchParams.has(key) || new URLSearchParams(url.hash.slice(1)).has(key),
    );

    if (!hasCallback) {
      if (reason === 'password-updated') {
        setState('success');
      } else {
        setMessage('No encontramos una respuesta de autenticación en este enlace.');
        setState('error');
      }
      return () => {
        active = false;
      };
    }

    void processAuthCallback(url)
      .then((callback) => {
        if (!callback?.session) {
          throw new Error('No se pudo crear una sesión para completar el acceso.');
        }
        clearCallbackFromAddressBar('/auth-success');
        if (active) setState('success');
      })
      .catch((error: unknown) => {
        clearCallbackFromAddressBar('/auth-success');
        if (active) {
          setMessage(getAuthErrorMessage(error));
          setState('error');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <AuthCard
      description={
        state === 'success'
          ? reason === 'password-updated'
            ? 'Tu nueva contraseña ya protege tu cuenta. Puedes volver a iniciar sesión en Student Notes.'
            : 'Tu identidad se verificó correctamente. Ya puedes continuar con Student Notes.'
          : 'Estamos terminando de validar tu acceso de forma segura.'
      }
      eyebrow="ESTADO DE TU CUENTA"
      icon={<CheckCircle2 aria-hidden="true" className="text-success" size={21} />}
      title={state === 'error' ? 'No pudimos completar el acceso' : title}
    >
      {state === 'loading' ? <LoadingState label="Completando autenticación…" /> : null}
      {state === 'success' ? (
        <>
          <StatusCard
            message="La solicitud se completó correctamente."
            title="Todo listo"
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
      {state === 'error' ? (
        <>
          <StatusCard message={message} title="Revisa el enlace" variant="error" />
          <Link
            className="mt-5 flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_8px_24px_-12px_var(--primary)] transition hover:-translate-y-0.5 hover:brightness-105"
            to="/"
          >
            Volver al portal
          </Link>
        </>
      ) : null}
    </AuthCard>
  );
}
