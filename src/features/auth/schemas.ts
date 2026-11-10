import { z } from 'zod';

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Ingresa tu email.')
  .email('Ingresa un email válido.');

export const passwordSchema = z
  .string()
  .min(8, 'Usa al menos 8 caracteres.')
  .max(20, 'Usa hasta 20 caracteres.')
  .regex(/[A-Z]/, 'Incluye al menos una mayúscula.')
  .regex(/[0-9]/, 'Incluye al menos un número.')
  .regex(/[^A-Za-z0-9\s]/, 'Incluye al menos un símbolo.');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Ingresa tu contraseña.'),
});

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(2, 'Ingresa tu nombre.').max(40),
    lastName: z.string().trim().min(2, 'Ingresa tu apellido.').max(40),
    username: z
      .string()
      .trim()
      .min(3, 'Usa al menos 3 caracteres.')
      .max(20, 'Usa hasta 20 caracteres.')
      .regex(
        /^[a-zA-Z0-9._-]+$/,
        'Usa un nombre de usuario, no un email. Se permiten letras, números, puntos, guiones y guiones bajos.',
      ),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirma tu contraseña.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirma tu contraseña.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
