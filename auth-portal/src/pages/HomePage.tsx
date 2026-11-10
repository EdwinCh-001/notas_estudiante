import { ArrowRight, KeyRound, ShieldCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { AuthCard } from '../components/AuthCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { StatusCard } from '../components/StatusCard';
import { getAuthErrorMessage } from '../lib/auth';
import { supabase } from '../lib/supabase';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [notice, setNotice] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice('');
    setErrorMessage('');

    const normalizedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setEmailError('Escribe una dirección de correo válida.');
      return;
    }

    setEmailError('');
    if (!supabase) {
      setErrorMessage('El servicio de autenticación todavía no está configurado.');
      return;
    }

    setIsSending(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setNotice(
        'Si existe una cuenta con ese correo, recibirás instrucciones para recuperar el acceso.',
      );
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsSending(false);
    }
  }

  return (
    <AuthCard
      description="Accede de nuevo a tus apuntes y continúa justo donde lo dejaste."
      eyebrow="TU ESPACIO DE ESTUDIO"
      icon={<KeyRound aria-hidden="true" size={21} strokeWidth={1.8} />}
      title="Recupera el acceso a tu cuenta"
    >
      <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Correo electrónico</span>
          <input
            autoComplete="email"
            className="min-h-12 w-full rounded-xl border border-border bg-background/80 px-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary"
            onChange={(event) => {
              setEmail(event.target.value);
              setEmailError('');
            }}
            placeholder="tu@correo.com"
            required
            type="email"
            value={email}
          />
          {emailError ? <span className="mt-1.5 block text-xs text-danger">{emailError}</span> : null}
        </label>

        <PrimaryButton loading={isSending} type="submit">
          Enviar enlace seguro <ArrowRight aria-hidden="true" size={16} />
        </PrimaryButton>
      </form>

      {notice ? (
        <div className="mt-4">
          <StatusCard message={notice} title="Revisa tu correo" variant="success" />
        </div>
      ) : null}
      {errorMessage ? (
        <div className="mt-4">
          <StatusCard message={errorMessage} title="No se pudo enviar" variant="error" />
        </div>
      ) : null}

      <div className="mt-7 flex items-start gap-3 border-t border-border pt-5">
        <ShieldCheck aria-hidden="true" className="mt-0.5 shrink-0 text-success" size={17} />
        <p className="text-xs leading-5 text-muted">
          Protegemos tu cuenta. Por seguridad, nunca confirmamos si una dirección
          está registrada.
        </p>
      </div>
      <p className="mt-5 text-center text-xs leading-5 text-muted">
        El enlace de confirmación que recibiste abrirá el portal automáticamente.
      </p>
    </AuthCard>
  );
}
