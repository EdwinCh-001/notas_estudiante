export class AuthOperationError extends Error {
  readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'AuthOperationError';
    this.code = code;
  }
}

function getErrorCode(error: unknown): string | undefined {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    return error.code;
  }

  return undefined;
}

export function toAuthOperationError(error: unknown): AuthOperationError {
  if (error instanceof AuthOperationError) {
    return error;
  }

  const code = getErrorCode(error);

  switch (code) {
    case 'invalid_credentials':
    case 'invalid_grant':
      return new AuthOperationError(
        'El email o la contraseña no son correctos.',
        code,
      );
    case 'email_not_confirmed':
      return new AuthOperationError(
        'Confirma tu email antes de iniciar sesión.',
        code,
      );
    case 'user_already_exists':
      return new AuthOperationError(
        'No se pudo crear la cuenta. Intenta iniciar sesión o usa otro email.',
        code,
      );
    case '23505':
      return new AuthOperationError(
        'Ese nombre de usuario ya está en uso.',
        code,
      );
    case 'over_email_send_rate_limit':
    case 'email_rate_limit_exceeded':
      return new AuthOperationError(
        'Se alcanzó el límite de emails. Espera un momento e inténtalo otra vez.',
        code,
      );
    default:
      break;
  }

  if (error instanceof Error) {
    if (error.message.includes('EXPO_PUBLIC_SUPABASE_')) {
      return new AuthOperationError(error.message, code);
    }

    if (error instanceof TypeError) {
      return new AuthOperationError(
        'No fue posible conectar. Revisa tu conexión a internet e inténtalo de nuevo.',
        code,
      );
    }
  }

  return new AuthOperationError(
    'No se pudo completar la solicitud. Inténtalo de nuevo.',
    code,
  );
}
