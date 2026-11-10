# Auth Portal

Portal independiente de autenticación de Student Notes, implementado como SPA
con Vite, React, TypeScript, Tailwind CSS v4, React Router y Supabase Auth.

## Desarrollo local

```bash
cd auth-portal
npm install
Copy-Item .env.example .env.local
```

Completa `.env.local` con las credenciales de tu propio proyecto Supabase y
arranca Vite:

```dotenv
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

```bash
npm run dev
```

La URL de desarrollo por defecto de Vite es `http://localhost:5173`. Si Vite
selecciona otro puerto, registra el puerto que muestra la terminal en Supabase.

## Rutas

| Ruta | Uso |
| --- | --- |
| `/` | Solicitar un enlace de recuperación |
| `/verify-email` | Verificar dirección de correo desde token Supabase |
| `/reset-password` | Validar enlace y sesión de recuperación |
| `/update-password` | Establecer y confirmar una nueva contraseña |
| `/auth-success` | Resultado correcto; callback PKCE disponible para OAuth futuro |
| `/auth-error` | Estado de error reutilizable |

El portal consume `token_hash` y `type` directamente mediante `verifyOtp`, por
lo que el callback no depende de compartir la sesión/almacenamiento de Expo con
el navegador. Los callbacks por código PKCE y por access/refresh token también
se reconocen cuando Supabase los entrega.

## Supabase Authentication

1. En **Authentication → URL Configuration**, configura **Site URL** con el
   origen de tu deployment real del portal, sin inventar ni reutilizar una URL
   de ejemplo. Para probar links locales, puedes cambiar temporalmente Site URL
   a `http://localhost:5173` o usar un proyecto Supabase de desarrollo; Site URL
   es una configuración global, así que restáurala al host de producción al
   terminar.
2. Añade a **Redirect URLs** los orígenes y rutas que realmente utilizarás:
   - Desarrollo: `http://localhost:5173/verify-email`,
     `http://localhost:5173/reset-password`,
     `http://localhost:5173/update-password`,
     `http://localhost:5173/auth-success` y
     `http://localhost:5173/auth-error`.
   - Producción: las mismas rutas bajo el dominio exacto asignado o conectado
     en Vercel. No uses un dominio inventado; añádelo después del deployment.
3. En **Authentication → Email Templates**, configura confirmación y
   recuperación para abrir el portal con el token hash:

   **Confirm signup**

   ```html
   <h2>Confirma tu correo</h2>
   <p><a href="{{ .SiteURL }}/verify-email?token_hash={{ .TokenHash }}&amp;type=email">Confirmar correo</a></p>
   ```

   **Reset password**

   ```html
   <h2>Restablece tu contraseña</h2>
   <p><a href="{{ .SiteURL }}/reset-password?token_hash={{ .TokenHash }}&amp;type=recovery">Elegir una nueva contraseña</a></p>
   ```

   Los enlaces usan `.SiteURL` para dirigir siempre al portal; al probar en
   local, Site URL debe coincidir con `localhost` como se indica arriba. Para
   previews, configura una URL/plantilla de prueba apropiada. No envíes
   `service_role`; el portal usa solo la clave publicable `anon`.
4. Habilita Email/Password en **Authentication → Providers → Email** y configura
   el SMTP de producción para entrega fiable.
5. Si el alta o recuperación se inicia desde Expo, alinea las plantillas y el
   destino que envía la aplicación para que el usuario llegue al portal.
   Después del cambio, el usuario podrá iniciar sesión en la app con la
   contraseña nueva; las sesiones del portal y de Expo se almacenan por
   separado.

Los tokens de verificación son de un solo uso. Un enlace inválido o expirado
muestra un estado recuperable; el inicio de recuperación no revela si el email
está registrado.

## Vercel

1. Importa el repositorio en Vercel.
2. En **Project Settings → General → Root Directory**, establece
   `auth-portal`. Esta carpeta contiene su propio `package.json` y
   `package-lock.json`.
3. Configura los comandos:
   - Install: `npm ci`
   - Build: `npm run build`
   - Output Directory: `dist`
4. En **Settings → Environment Variables**, añade para Production, Preview y
   Development según corresponda:
   - `VITE_SUPABASE_URL`: URL de tu proyecto Supabase.
   - `VITE_SUPABASE_ANON_KEY`: clave publicable/anon de ese proyecto.
5. Haz un nuevo deployment cuando cambies variables de entorno. Añade el host
   real que Vercel asigne a Supabase `Site URL`, Redirect URLs y plantillas.

`vercel.json` aplica el rewrite SPA necesario para que las rutas de React Router
carguen directamente al abrir o refrescar una URL.

## Comandos

```bash
npm run dev       # desarrollo local
npm run typecheck # verificación TypeScript
npm run lint      # ESLint
npm run build     # typecheck y build de producción
npm run preview   # probar localmente el build de dist/
```

## Dependencias

Runtime: `react`, `react-dom`, `react-router-dom`, `@supabase/supabase-js`,
`lucide-react`, `framer-motion`.

Desarrollo/build: `vite`, `@vitejs/plugin-react`, `typescript`,
`@tailwindcss/vite`, `typescript-eslint`, `eslint` y tipos de React.
