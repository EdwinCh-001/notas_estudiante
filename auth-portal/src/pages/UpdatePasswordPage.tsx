import { Check, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { AuthCard } from '../components/AuthCard';
import { LoadingState } from '../components/LoadingState';
import { PrimaryButton } from '../components/PrimaryButton';
import { StatusCard } from '../components/StatusCard';
import {
  clearRecoverySessionMarker,
  getAuthErrorMessage,
  hasValidRecoverySession,
} from '../lib/auth';
import { getPasswordStrength, isPasswordValid, passwordChecks } from '../lib/password';
import { supabase } from '../lib/supabase';

type PageStatus = 'checking' | 'ready' | 'invalid';

export default function UpdatePasswordPage() {
  const navigate = useNavigate();
  const [pageStatus, setPageStatus] = useState<PageStatus>('checking');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const strength = getPasswordStrength(password);
  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const canSubmit = isPasswordValid(password) && password === confirmPassword;

  useEffect(() => {
    let active = true;
    void hasValidRecoverySession().then((isValid) => {
      if (active) setPageStatus(isValid ? 'ready' : 'invalid');
    }).catch(() => {
      if (active) setPageStatus('invalid');
    });
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    if (!canSubmit || !supabase) return;

    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      clearRecoverySessionMarker();
      navigate('/auth-success?reason=password-updated', { replace: true });
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  if (pageStatus === 'checking') {
    return (
      <AuthCard
        description="Estamos validando la sesión de recuperación."
        eyebrow="RECUPERACIÓN SEGURA"
        icon={<KeyRound aria-hidden="true" size={21} />}
        title="Un momento…"
      >
        <LoadingState label="Validando sesión de recuperación…" />
      </AuthCard>
    );
  }

  if (pageStatus === 'invalid') {
    return (
      <AuthCard
        description="Para proteger tu cuenta, solo puedes cambiar la contraseña desde un enlace de recuperación válido."
        eyebrow="ENLACE NO DISPONIBLE"
        icon={<KeyRound aria-hidden="true" size={21} />}
        title="Solicita un nuevo enlace"
      >
        <StatusCard
          message="El enlace pudo haber vencido, ya fue usado o esta página se abrió sin un enlace de recuperación."
          title="La sesión no es válida"
          variant="warning"
        />
        <Link
          className="mt-5 flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_8px_24px_-12px_var(--primary)] transition hover:-translate-y-0.5 hover:brightness-105"
          to="/"
        >
          Volver a solicitarlo
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      description="Crea una contraseña nueva. No reutilices una contraseña que uses en otros servicios."
      eyebrow="ACTUALIZA TU ACCESO"
      icon={<KeyRound aria-hidden="true" size={21} />}
      title="Elige una nueva contraseña"
    >
      <form className="space-y-5" onSubmit={(event) => void handleSubmit(event)}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Nueva contraseña</span>
          <span className="relative block">
            <input
              autoComplete="new-password"
              className="min-h-12 w-full rounded-xl border border-border bg-background/80 px-4 pr-12 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Escribe una contraseña segura"
              type={showPassword ? 'text' : 'password'}
              value={password}
            />
            <button
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted hover:text-foreground"
              onClick={() => setShowPassword((value) => !value)}
              type="button"
            >
              {showPassword ? <EyeOff aria-hidden="true" size={17} /> : <Eye aria-hidden="true" size={17} />}
            </button>
          </span>
        </label>

        <div aria-live="polite" className="rounded-xl border border-border bg-background/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-muted">Seguridad de la contraseña</span>
            <span className="text-xs font-semibold text-foreground">
              {password ? strength.label : 'Sin evaluar'}
            </span>
          </div>
          <div aria-hidden="true" className="mt-3 grid grid-cols-4 gap-1.5">
            {passwordChecks.map((_, index) => (
              <span
                className={`h-1 rounded-full transition-colors ${
                  index < strength.score
                    ? strength.score <= 1
                      ? 'bg-danger'
                      : strength.score <= 2
                        ? 'bg-warning'
                        : 'bg-success'
                    : 'bg-border'
                }`}
                key={index}
              />
            ))}
          </div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {passwordChecks.map((check) => {
              const passed = check.test(password);
              return (
                <li
                  className={`flex items-center gap-2 text-[11px] ${
                    passed ? 'text-success' : 'text-muted'
                  }`}
                  key={check.label}
                >
                  <Check aria-hidden="true" size={13} />
                  {check.label}
                </li>
              );
            })}
          </ul>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium">Confirma la contraseña</span>
          <span className="relative block">
            <input
              autoComplete="new-password"
              className={`min-h-12 w-full rounded-xl border bg-background/80 px-4 pr-12 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary ${
                mismatch ? 'border-danger' : 'border-border'
              }`}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Vuelve a escribirla"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
            />
            <button
              aria-label={showConfirmPassword ? 'Ocultar confirmación' : 'Mostrar confirmación'}
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted hover:text-foreground"
              onClick={() => setShowConfirmPassword((value) => !value)}
              type="button"
            >
              {showConfirmPassword ? <EyeOff aria-hidden="true" size={17} /> : <Eye aria-hidden="true" size={17} />}
            </button>
          </span>
          {mismatch ? (
            <span className="mt-1.5 block text-xs text-danger">Las contraseñas no coinciden.</span>
          ) : null}
        </label>

        {errorMessage ? (
          <StatusCard message={errorMessage} title="No se pudo actualizar" variant="error" />
        ) : null}

        <PrimaryButton disabled={!canSubmit} loading={isSaving} type="submit">
          Guardar nueva contraseña
        </PrimaryButton>
      </form>
    </AuthCard>
  );
}
