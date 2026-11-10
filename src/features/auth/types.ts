/** App-facing auth contracts; the active Supabase session is exported directly. */
export type AuthStatus =
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated';

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  expiresAt?: number;
}
