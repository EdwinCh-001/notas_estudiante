import { Link, Route, Routes } from 'react-router-dom';

import { PortalLayout } from './components/PortalLayout';
import AuthErrorPage from './pages/AuthErrorPage';
import AuthSuccessPage from './pages/AuthSuccessPage';
import HomePage from './pages/HomePage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';

function NotFoundPage() {
  return (
    <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-xl">
      <p className="text-xs font-semibold tracking-[.18em] text-primary">404</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">Esta página no existe</h1>
      <p className="mt-2 text-sm text-muted">Vuelve al portal para continuar.</p>
      <Link className="mt-6 inline-flex text-sm font-semibold text-primary hover:underline" to="/">
        Ir al inicio
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <PortalLayout>
      <Routes>
        <Route element={<HomePage />} path="/" />
        <Route element={<OAuthCallbackPage />} path="/auth/callback" />
        <Route element={<VerifyEmailPage />} path="/verify-email" />
        <Route element={<ResetPasswordPage />} path="/reset-password" />
        <Route element={<UpdatePasswordPage />} path="/update-password" />
        <Route element={<AuthSuccessPage />} path="/auth-success" />
        <Route element={<AuthErrorPage />} path="/auth-error" />
        <Route element={<NotFoundPage />} path="*" />
      </Routes>
    </PortalLayout>
  );
}
