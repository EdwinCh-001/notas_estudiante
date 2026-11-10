import type { Session } from '@supabase/supabase-js';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { supabase } from '../lib/supabase';

type AuthContextValue = {
  session: Session | null;
  isLoading: boolean;
  initializationError: string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(supabase));
  const [initializationError, setInitializationError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;

    let active = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) setSession(nextSession);
    });

    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setInitializationError(
            'No pudimos restaurar la sesión. Recarga la página para volver a intentarlo.',
          );
        } else {
          setSession(data.session);
        }
        setIsLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setInitializationError(
          'No pudimos restaurar la sesión. Recarga la página para volver a intentarlo.',
        );
        setIsLoading(false);
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({ session, isLoading, initializationError }),
    [session, isLoading, initializationError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider.');
  }
  return context;
}
