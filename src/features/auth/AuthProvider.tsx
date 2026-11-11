import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { AppState, Platform } from 'react-native';

import {
  isSupabaseConfigured,
  getSupabaseClient,
} from '@/lib/supabase/client';

import {
  exchangeOAuthCodeForSession,
  sendPasswordResetEmail,
  signInWithEmail,
  signInWithGoogle,
  signOut,
  signUpWithEmail,
  updatePassword,
  type GoogleOAuthResult,
  type SignInCredentials,
  type SignUpDetails,
} from './authService';
import { AuthOperationError, toAuthOperationError } from './authErrors';

export interface AuthContextValue {
  session: Session | null;
  isLoading: boolean;
  configurationError: string | null;
  initializationError: AuthOperationError | null;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signInWithGoogle: () => Promise<GoogleOAuthResult>;
  signUp: (
    details: SignUpDetails,
    redirectTo?: string,
  ) => Promise<{ emailConfirmationRequired: boolean }>;
  requestPasswordReset: (
    email: string,
    redirectTo?: string,
  ) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

const missingConfigurationMessage =
  'La autenticación no está configurada. Define EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY en .env.';

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(() => isSupabaseConfigured());
  const [initializationError, setInitializationError] =
    useState<AuthOperationError | null>(null);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) {
      return;
    }

    let active = true;
    let authEventObserved = false;

    try {
      const client = getSupabaseClient();
      const handleAuthUrl = async (url: string) => {
        const parsedUrl = new URL(url);
        const searchParams = new URLSearchParams(parsedUrl.search);
        const hashParams = new URLSearchParams(parsedUrl.hash.slice(1));
        const code = searchParams.get('code');

        if (code) {
          await exchangeOAuthCodeForSession(code);
          return;
        }

        const authError =
          searchParams.get('error_description') ?? hashParams.get('error_description');
        if (authError) {
          throw new Error(authError);
        }

        const accessToken =
          searchParams.get('access_token') ?? hashParams.get('access_token');
        const refreshToken =
          searchParams.get('refresh_token') ?? hashParams.get('refresh_token');

        if (!accessToken || !refreshToken) {
          return;
        }

        const { error } = await client.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          throw error;
        }
      };
      const handleAuthUrlError = (error: unknown) => {
        if (active) {
          setInitializationError(toAuthOperationError(error));
        }
      };
      const {
        data: { subscription },
      } = client.auth.onAuthStateChange((_event, nextSession) => {
        authEventObserved = true;
        if (active) {
          setSession(nextSession);
          setInitializationError(null);
        }
      });
      const urlSubscription = Linking.addEventListener('url', ({ url }) => {
        void handleAuthUrl(url).catch(handleAuthUrlError);
      });

      const initialUrlPromise = Linking.getInitialURL().then((url) =>
        url ? handleAuthUrl(url) : undefined,
      );

      let appStateSubscription: ReturnType<
        typeof AppState.addEventListener
      > | null = null;
      if (Platform.OS !== 'web') {
        const setAutoRefresh = (state: string | null) => {
          const operation =
            state === 'active'
              ? client.auth.startAutoRefresh()
              : client.auth.stopAutoRefresh();
          void operation.catch(handleAuthUrlError);
        };

        setAutoRefresh(AppState.currentState ?? null);
        appStateSubscription = AppState.addEventListener(
          'change',
          setAutoRefresh,
        );
      }

      void (async () => {
        try {
          const [sessionResult] = await Promise.all([
            client.auth.getSession(),
            initialUrlPromise,
          ]);

          if (sessionResult.error) {
            throw sessionResult.error;
          }

          if (active && !authEventObserved) {
            setSession(sessionResult.data.session);
          }
        } catch (error) {
          if (active) {
            setInitializationError(toAuthOperationError(error));
          }
        } finally {
          if (active) {
            setIsLoading(false);
          }
        }
      })();

      return () => {
        active = false;
        subscription.unsubscribe();
        urlSubscription.remove();
        appStateSubscription?.remove();
        if (Platform.OS !== 'web') {
          void client.auth.stopAutoRefresh().catch(handleAuthUrlError);
        }
      };
    } catch (error) {
      void Promise.resolve().then(() => {
        if (active) {
          setInitializationError(toAuthOperationError(error));
          setIsLoading(false);
        }
      });
      return () => {
        active = false;
      };
    }
  }, [configured]);

  const signIn = useCallback(
    (credentials: SignInCredentials) => signInWithEmail(credentials),
    [],
  );
  const handleGoogleSignIn = useCallback(() => signInWithGoogle(), []);

  const signUp = useCallback(
    (details: SignUpDetails, redirectTo?: string) =>
      signUpWithEmail(details, redirectTo),
    [],
  );

  const requestPasswordReset = useCallback(
    (email: string, redirectTo?: string) =>
      sendPasswordResetEmail(email, redirectTo),
    [],
  );

  const handleSignOut = useCallback(() => signOut(), []);
  const handleUpdatePassword = useCallback(
    (password: string) => updatePassword(password),
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isLoading,
      configurationError: configured ? null : missingConfigurationMessage,
      initializationError,
      signIn,
      signInWithGoogle: handleGoogleSignIn,
      signUp,
      requestPasswordReset,
      updatePassword: handleUpdatePassword,
      signOut: handleSignOut,
    }),
    [
      session,
      isLoading,
      configured,
      initializationError,
      signIn,
      handleGoogleSignIn,
      signUp,
      requestPasswordReset,
      handleUpdatePassword,
      handleSignOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
