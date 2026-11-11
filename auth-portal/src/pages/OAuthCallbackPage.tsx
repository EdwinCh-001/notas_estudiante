import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { AuthCard } from '../components/AuthCard';
import { LoadingState } from '../components/LoadingState';
import { getAuthErrorMessage, isExpiredAuthError, processAuthCallback } from '../lib/auth';

export default function OAuthCallbackPage() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    async function completeOAuth() {
      try {
        const url = new URL(window.location.href);
        const query = new URLSearchParams(url.search);
        const hash = new URLSearchParams(url.hash.slice(1));
        const code = query.get('code') ?? hash.get('code');

        if (!code) {
          throw new Error(
            query.get('error_description') ??
              query.get('error') ??
              hash.get('error_description') ??
              hash.get('error') ??
              'El callback de Google no contiene un código de autorización.',
          );
        }

        const callback = await processAuthCallback(url);
        if (!callback?.session) {
          throw new Error('Supabase no devolvió una sesión para completar el acceso.');
        }

        if (active) {
          navigate('/auth-success?reason=google-oauth', { replace: true });
        }
      } catch (error) {
        if (active) {
          navigate('/auth-error', {
            replace: true,
            state: {
              message: getAuthErrorMessage(error),
              expired: isExpiredAuthError(error),
            },
          });
        }
      }
    }

    void completeOAuth();

    return () => {
      active = false;
    };
  }, [location.key, navigate]);

  return (
    <AuthCard
      description="Estamos validando la respuesta de Google y preparando tu sesión segura."
      eyebrow="INICIO DE SESIÓN"
      title="Conectando tu cuenta"
    >
      <LoadingState label="Completando autenticación…" />
    </AuthCard>
  );
}
