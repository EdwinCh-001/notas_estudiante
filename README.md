# Student Notes

Aplicación móvil personal de notas con autenticación Supabase, dashboard,
búsqueda, categorías y CRUD de notas.

La app está diseñada **mobile first y Android first** para verse correctamente
en dispositivos de 360dp a 430dp de ancho. En tablets el contenido se limita a
520dp y se centra; no hay layouts pensados para escritorio.

## Stack

- Expo SDK 58 / React Native 0.88 / React 19.3
- TypeScript 6 (modo estricto)
- Expo Router 58 (rutas tipadas)
- Uniwind 1.13 + Tailwind CSS 4.3
- Lucide React Native + `react-native-svg`
- `tailwind-merge` para composición segura de `className`
- Supabase Auth con flujo PKCE y sesión nativa persistida con SecureStore

## Estructura

Las rutas viven en `src/app` porque Expo Router lo soporta de forma oficial y
es la convención definida para este proyecto. El resto del código se mantiene
fuera de `src/app` para que ningún archivo que no sea una ruta sea tratado como
tal.

```text
src/
├── app/                          # Rutas de Expo Router
│   ├── _layout.tsx               # Providers, tema, StatusBar y Stack raíz
│   ├── index.tsx                 # Redirección a /(auth)/welcome
│   ├── auth/
│   │   └── callback.tsx          # Callback de OAuth PKCE
│   ├── (auth)/
│   │   ├── _layout.tsx            # Redirección según sesión
│   │   ├── welcome.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── forgot-password.tsx
│   │   └── reset-password.tsx
│   └── (protected)/
│       ├── _layout.tsx            # Guardia de sesión y stack privado
│       ├── home.tsx                # Mantiene el destino previo y abre Inicio
│       ├── (tabs)/                 # Inicio, Notas, Buscar y Perfil
│       │   ├── dashboard.tsx
│       │   ├── notes.tsx
│       │   ├── search.tsx
│       │   └── profile.tsx
│       ├── notes/                  # Detalle, editor y creación
│       ├── categories/             # Creación de categorías
│       ├── profile/                # Edición del perfil
│       ├── settings.tsx
│       └── change-password.tsx
├── components/
│   ├── ui/                       # Button, Input, PasswordInput, Card...
│   ├── common/                   # BrandMark, FlowLinesBackground
│   └── layouts/                  # AuthLayout, AppLayout
├── features/
│   ├── auth/                     # Provider, servicio, esquemas y UI de auth
│   ├── notes/                    # Tipos, consultas, mutaciones y UI de notas
│   └── profile/                  # Tipos, consultas y actualización del perfil
├── hooks/                        # useAppTheme, useResponsive
├── lib/
│   ├── cn.ts
│   └── supabase/                 # Cliente, SecureStore y tipos de DB
├── services/                     # Integraciones futuras
├── store/                        # Estado global de cliente (futuro)
├── constants/                    # Nombre, tagline y rutas
├── theme/                        # Tokens, ThemeProvider y paleta decorativa
├── types/                        # Tipos compartidos
└── global.css                    # Entrada de Tailwind + Uniwind
```

## Tema y design tokens

### Colores

La fuente de verdad está en `src/global.css`. Los colores son **semánticos**,
no nombres de colores crudos:

- `background`, `foreground`, `muted-foreground`
- `background-subtle`, `card`, `card-muted`, `secondary` y `secondary-foreground`
- `primary`, `primary-foreground`, `accent`, `accent-soft`
- `border`, `border-strong`, `input`, `input-border`, `ring`
- `danger`, `danger-soft`, `success`, `warning`

Cada token tiene su valor en `@variant light` y `@variant dark`. Los componentes
usan clases como `bg-card`, `text-foreground` o `border-border`, por lo que
nunca necesitan comprobar el tema manualmente.

Los mismos tokens semánticos están tipados en `ThemeColors` y vinculados a sus
variables CSS en `src/theme/tokens.ts`. Esto mantiene los valores disponibles
desde JavaScript para propiedades nativas, iconos y SVG, con fallbacks antes de
que Uniwind resuelva el tema.

### Modo del sistema y sobreescritura futura

`ThemeProvider` arranca en modo `system`, por lo que Uniwind sigue la
preferencia del dispositivo. Para una futura pantalla de configuración basta con
consumir el hook:

```tsx
const { mode, setMode } = useAppTheme();

setMode('system'); // seguir al dispositivo
setMode('light');  // forzar claro
setMode('dark');   // forzar oscuro
```

El proveedor puede recibir `initialMode` para restaurar una preferencia
persistida cuando se añada almacenamiento.

### Tipografía

La escala vive en `@theme` dentro de `global.css` y genera utilidades:

| Token | Uso |
| --- | --- |
| `text-display` | Título principal / hero |
| `text-title` | Títulos de pantalla |
| `text-heading` | Títulos de sección |
| `text-subtitle` | Texto destacado |
| `text-body` | Texto principal |
| `text-label` | Labels y botones pequeños |
| `text-caption` | Texto auxiliar |
| `text-overline` | Eyebrows en mayúsculas |

Se usa la tipografía del sistema para evitar cargas de fuentes y mantener el
rendimiento en Android. Los pesos se controlan con `font-medium`,
`font-semibold` y `font-bold`.

### Acceso a colores desde JavaScript

Algunas APIs nativas necesitan un color real (iconos Lucide, SVG, placeholder
de un `TextInput`). `ThemeProvider` resuelve esos tokens con
`useCSSVariable` y los expone en `colors`, con fallbacks en
`src/theme/tokens.ts`. Para estilos normales, usa siempre `className`.

## Sistema de diseño

Componentes en `src/components/ui`:

- **Button**: variantes `primary`, `secondary`, `outline`, `ghost`; tamaños
  `sm`, `md`, `lg`; loading, iconos, full width y estado deshabilitado.
- **Input**: label, hint, error, iconos, estados de foco y error; reenvía la
  ref al `TextInput`.
- **PasswordInput**: reutiliza `Input` y añade el toggle de visibilidad.
- **Card**: variantes `default`, `muted`, `elevated`; padding configurable.
- **ScreenContainer**: safe area, scroll opcional, padding responsive y ancho
  máximo para tablets.
- **SectionTitle**: eyebrow, título, subtítulo y acción opcional.

`cn()` combina clases con `tailwind-merge`, de modo que un consumidor puede
sobreescribir estilos sin pelearse con las clases por defecto.

## Fondo reusable

`FlowLinesBackground` combina:

- **Flow Lines**: curvas Bézier vectoriales de baja opacidad.
- **Aurora Accent**: tres halos radiales violeta, azul y teal.

Está implementado con `react-native-svg` y es **estático**: no usa animaciones,
blur, `expo-blur` ni gradientes costosos. Se renderiza una sola vez por pantalla,
no intercepta toques (`pointerEvents="none"`) y se adapta a claro/oscuro. Es
reutilizable en cualquier pantalla a través de `AuthLayout`, `AppLayout` o
directamente.

## Navegación

```text
/                    -> redirige a /(auth)/welcome
/(auth)/welcome      -> bienvenida temporal, Comenzar abre Login
/(auth)/login        -> inicio de sesión Email/Password o Google
/(auth)/register     -> registro Email/Password y perfil inicial
/(auth)/forgot-password -> solicita enlace de recuperación
/(auth)/reset-password -> establece una nueva contraseña desde el enlace
/(protected)/home      -> redirección compatible al dashboard Inicio
/(protected)/dashboard -> dashboard personal (tab Inicio)
/(protected)/notes     -> notas, filtros y acciones rápidas
/(protected)/search    -> búsqueda instantánea y filtros
/(protected)/profile   -> perfil, configuración y cierre de sesión
/notes/new             -> editor para crear una nota
/notes/[id]            -> detalle de nota
/notes/[id]/edit       -> editor de nota existente
/categories/new        -> alta de categoría
/settings              -> tema, cuenta e información de la app
/auth/callback       -> intercambio del código OAuth por una sesión PKCE
```

- `(auth)` redirige usuarios con sesión a `(protected)`.
- `(protected)` requiere una sesión restaurada.
- Los datos de notas, categorías y perfil se consultan en Supabase para el
  usuario autenticado; no se incluyen registros de muestra.
- Favorito, fijado y archivado aplican actualización optimista y restauran el
  estado anterior si Supabase responde con error.

## Autenticación con Supabase

`src/lib/supabase/client.ts` crea un cliente tipado usando
`EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY`. No se necesita ni
debe incluirse una `service_role` key en la app. Copia las claves vacías de
`.env.example` a `.env` local y completa tus propios valores. `.env` está
ignorado por Git.

En Android/iOS, Supabase persiste la sesión con `expo-secure-store`; en web usa
el almacenamiento web predeterminado de Supabase. El provider restaura la
sesión, escucha cambios de Auth y controla el refresco del token cuando la app
entra/sale del primer plano. También procesa deep links de confirmación y
recuperación: intercambia códigos PKCE por sesión y acepta callbacks con
tokens para compatibilidad con enlaces existentes.

El registro envía nombre, apellido y username como metadata de Auth. Un trigger
de base de datos crea el perfil atómicamente incluso cuando se exige confirmar
el email. La recuperación llega a `/(auth)/reset-password`, donde se establece
la nueva contraseña. Google OAuth usa el mismo cliente Supabase PKCE, y el
trigger de `auth.users` crea el perfil; la app no duplica esa operación.

### Notas y categorías: SQL pendiente de ejecutar

El siguiente SQL crea las tablas de categorías y notas, sus índices, RLS,
permisos y trigger de actualización. Se apoya en `public.profiles` y en la
sesión Supabase ya configuradas; **no se ejecuta automáticamente desde la app**.
Ejecuta una sola vez en SQL Editor cuando apruebes el esquema.

```sql
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 40),
  color text not null default '#6366F1'
    check (color ~ '^#[0-9A-Fa-f]{6}$'),
  icon text not null default 'folder'
    check (icon in ('folder', 'book', 'work', 'science', 'ideas')),
  created_at timestamptz not null default now()
);

create unique index if not exists categories_user_name_lower_idx
  on public.categories (user_id, lower(name));
create index if not exists categories_user_created_idx
  on public.categories (user_id, created_at desc);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  content text not null default '',
  color text not null default '#6366F1'
    check (color ~ '^#[0-9A-Fa-f]{6}$'),
  is_favorite boolean not null default false,
  is_pinned boolean not null default false,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notes_user_updated_idx
  on public.notes (user_id, updated_at desc);
create index if not exists notes_user_category_idx
  on public.notes (user_id, category_id);
create index if not exists notes_user_favorites_idx
  on public.notes (user_id, updated_at desc)
  where is_favorite and not is_archived;
create index if not exists notes_user_pinned_idx
  on public.notes (user_id, updated_at desc)
  where is_pinned and not is_archived;
create index if not exists notes_user_archived_idx
  on public.notes (user_id, updated_at desc)
  where is_archived;

alter table public.categories enable row level security;
alter table public.notes enable row level security;

revoke all on table public.categories, public.notes from anon, authenticated;
grant select, insert, update, delete on table public.categories to authenticated;
grant select, insert, update, delete on table public.notes to authenticated;

drop policy if exists "Categories are readable by owner" on public.categories;
create policy "Categories are readable by owner"
  on public.categories for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Categories are insertable by owner" on public.categories;
create policy "Categories are insertable by owner"
  on public.categories for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Categories are editable by owner" on public.categories;
create policy "Categories are editable by owner"
  on public.categories for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Categories are deletable by owner" on public.categories;
create policy "Categories are deletable by owner"
  on public.categories for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Notes are readable by owner" on public.notes;
create policy "Notes are readable by owner"
  on public.notes for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Notes are insertable by owner" on public.notes;
create policy "Notes are insertable by owner"
  on public.notes for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and (
      category_id is null
      or exists (
        select 1 from public.categories as category
        where category.id = category_id
          and category.user_id = (select auth.uid())
      )
    )
  );

drop policy if exists "Notes are editable by owner" on public.notes;
create policy "Notes are editable by owner"
  on public.notes for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and (
      category_id is null
      or exists (
        select 1 from public.categories as category
        where category.id = category_id
          and category.user_id = (select auth.uid())
      )
    )
  );

drop policy if exists "Notes are deletable by owner" on public.notes;
create policy "Notes are deletable by owner"
  on public.notes for delete to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.set_note_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_note_updated on public.notes;
create trigger on_note_updated
  before update on public.notes
  for each row execute procedure public.set_note_updated_at();
```

La app consulta los perfiles existentes en `public.profiles`. El perfil debe
haber sido creado por el trigger de Auth documentado arriba; no se crea ni
actualiza una fila de perfil durante el flujo de notas.

### Google OAuth en móvil

Al pulsar **Continuar con Google**, Supabase genera la URL del proveedor, se
abre en el navegador del sistema y la app procesa el callback con
`exchangeCodeForSession()`. El intercambio se centraliza para evitar procesar
dos veces el mismo código cuando coinciden el deep-link listener y la ruta.

- La URI de callback de Development Build es
  `studentnotes://auth/callback` (usa el scheme ya declarado en `app.json`).
- Expo Go genera un callback dinámico basado en la dirección actual de Metro,
  normalmente `exp://<host>:<port>/--/auth/callback`. Añade a Supabase la URI
  exacta que produzca la sesión de desarrollo; puede cambiar al cambiar el host
  o iniciar Metro con otra modalidad de red.
- En **Supabase → Authentication → URL Configuration → Redirect URLs**, permite
  la URI de Development Build y la URI dinámica de Expo Go que estés usando.
- En **Supabase → Authentication → Providers → Google**, configura las
  credenciales de un cliente OAuth de tipo Web. En Google Cloud, el redirect
  URI autorizado del cliente Web debe ser el callback que muestra Supabase en
  la configuración del proveedor (no `studentnotes://...`).
- No se necesita un cliente OAuth nativo de Android/iOS para este flujo
  mediado por Supabase. Un scheme estable requiere una app instalada, por lo que
  prueba `studentnotes://auth/callback` con un Development Build; Expo Go usa
  su URL dinámica.
- `app.json` registra el plugin de `expo-web-browser`; después de cambiar
  configuración nativa, reinicia Metro y reconstruye el Development Build si
  corresponde.

### SQL exacto para `public.profiles` y RLS

Ejecuta este script una sola vez en el SQL Editor del proyecto Supabase. El
trigger crea el perfil con o sin metadata de perfil completa. La policy de
inserción permite que un usuario autenticado cree únicamente su propio perfil.

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text,
  last_name text,
  username text not null check (username ~ '^[A-Za-z0-9._-]{3,40}$'),
  email text not null unique,
  provider text not null default 'email',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username));

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant insert (id, first_name, last_name, username, email, provider, avatar_url)
  on public.profiles to authenticated;
grant update (first_name, last_name, username)
  on public.profiles to authenticated;

drop policy if exists "Profiles are readable by owner" on public.profiles;
create policy "Profiles are readable by owner"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Profiles are insertable by owner" on public.profiles;
create policy "Profiles are insertable by owner"
  on public.profiles for insert
  to authenticated
  with check (
    (select auth.uid()) = id
    and char_length(username) between 3 and 20
  );

drop policy if exists "Profiles are editable by owner" on public.profiles;
create policy "Profiles are editable by owner"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_full_name text;
  v_first_name text;
  v_last_name text;
  v_username text;
  v_provider text;
  v_avatar_url text;
begin
  v_full_name := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'name'), ''),
    ''
  );
  v_first_name := nullif(left(btrim(coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'first_name'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'given_name'), ''),
    nullif(split_part(v_full_name, ' ', 1), '')
  )), 40), '');
  v_last_name := nullif(left(btrim(coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'last_name'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'family_name'), ''),
    nullif(btrim(substr(v_full_name, length(split_part(v_full_name, ' ', 1)) + 1)), '')
  )), 40), '');
  v_username := nullif(lower(btrim(new.raw_user_meta_data ->> 'username')), '');
  v_provider := coalesce(
    nullif(lower(btrim(new.raw_app_meta_data ->> 'provider')), ''),
    'email'
  );
  v_avatar_url := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'avatar_url'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'picture'), '')
  );

  if v_username is null
    or v_username !~ '^[a-z0-9._-]{3,20}$'
    or exists (
      select 1
      from public.profiles as existing_profile
      where lower(existing_profile.username) = v_username
    )
  then
    v_username := 'tmp_' || replace(new.id::text, '-', '');
  end if;

  insert into public.profiles (
    id, first_name, last_name, username, email, provider, avatar_url
  )
  values (
    new.id,
    v_first_name,
    v_last_name,
    v_username,
    lower(btrim(new.email)),
    v_provider,
    v_avatar_url
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.email = lower(btrim(new.email));
  new.username = lower(btrim(new.username));
  new.provider = lower(btrim(new.provider));
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_profile_updated on public.profiles;
create trigger on_profile_updated
  before insert or update on public.profiles
  for each row execute procedure public.set_profile_updated_at();
```

### Configuración manual en Supabase

1. Copia `.env.example` a `.env` y completa la URL y la **anon/publishable
   key** del proyecto. Nunca uses la service-role key en Expo.
2. Reinicia Metro (`npx expo start -c`) para recargar las variables públicas.
3. En **Authentication → Providers → Email**, habilita Email/Password y elige
   si se debe confirmar el email.
4. En **Authentication → URL Configuration → Redirect URLs**, permite
   `studentnotes://**`. Para Expo Go local, añade la URL `exp://...` concreta
   que imprime Metro; para probar en navegador permite también el origen local
   exacto con `/auth/callback` (por ejemplo, `http://localhost:8081/auth/callback`
   si Metro usa ese puerto). No uses un wildcard amplio en producción.
5. Configura las plantillas y un proveedor SMTP de producción para confirmación
   y recuperación. El enlace de recuperación apunta a
   `studentnotes:///reset-password`.
6. Ejecuta el SQL anterior. Si el trigger falla, Supabase revierte el alta del
   usuario y la app presenta el error.

Para probar Google OAuth en navegador, ejecuta `npm run web`. En web, la app
redirige al proveedor y vuelve a `/auth/callback` en el mismo origen; el flujo
nativo continúa usando `studentnotes://auth/callback` y `expo-web-browser`.
La URL exacta de retorno del navegador debe estar permitida en Supabase Auth.

## Decisiones arquitectónicas

1. **Feature based + separación por capas**: `features/auth` contiene el
   provider y casos de uso; `lib/supabase` contiene infraestructura y
   persistencia segura; `components/ui` permanece reutilizable.
2. **Rutas finas**: los archivos de `src/app` solo componen layouts y pantallas.
   La lógica de negocio no vive en las rutas.
3. **Tokens semánticos**: cambiar la paleta o añadir un tema nuevo se hace en
   `global.css`, no en los componentes.
4. **Sin dependencias prematuras**: no se añadió React Query. Las consultas
   usan el cliente Supabase existente y actualizaciones optimistas acotadas a
   flags de nota.
5. **Rendimiento Android**: fondo SVG estático, sin animaciones, listas futuras
   deberán usar FlashList/FlatList, y se evitan sombras/blur innecesarios.
6. **Mobile first real**: padding responsive (20dp en pantallas compactas,
   24dp en el resto), targets táctiles de al menos 48dp, contenido centrado y
   limitado a 520dp en tablets.
7. **Datos tipados por dominio**: `Note`, `NoteDraft`, `NoteCategory` y
   `StudentProfile` reflejan el esquema SQL y mantienen el mapeo de Supabase
   fuera de las pantallas.

## Paquetes añadidos

Producción:

| Paquete | Versión | Motivo |
| --- | --- | --- |
| `uniwind` | 1.13.2 | Tailwind CSS 4 para React Native |
| `tailwindcss` | 4.3.3 | Motor de utilidades y tokens |
| `lucide-react-native` | 1.70.0 | Iconografía consistente |
| `react-native-svg` | 15.16.0 | Iconos y fondo vectorial |
| `tailwind-merge` | 3.4.1 | Resolución de clases conflictivas |
| `react-dom` | 19.3.0 | Fijado para resolver el peer opcional de Expo Router; no se usa en runtime móvil |
| `react-hook-form` | 7.91.0 | Estado de formularios con renderizado acotado |
| `zod` | 4.6.7 | Esquemas y validación de formularios |
| `@hookform/resolvers` | 7.0.5 | Integración de Zod con React Hook Form |
| `@supabase/supabase-js` | 2.119.0 | Cliente de Supabase y Auth |
| `expo-secure-store` | 58.0.2 | Persistencia cifrada de sesión en Android/iOS |
| `expo-web-browser` | 58.0.7 | Sesión del navegador para OAuth y retorno a la app |
| `react-native-web` | 0.21.4 | Renderizado React Native en navegador |
| `@expo/metro-runtime` | 58.0.17 | Runtime requerido por Expo Router en web |
| `react-native-url-polyfill` | 4.0.0 | APIs URL requeridas por Supabase en React Native |

Desarrollo:

| Paquete | Versión | Motivo |
| --- | --- | --- |
| `eslint` | 9.39.1 | Lint |
| `eslint-config-expo` | 58.0.4 | Reglas de Expo/React Native |
| `typescript` | 6.0.3 | Typecheck estricto |

## Configuración adicional

- `package.json`: `main` apunta a `expo-router/entry`.
- `app.json`: `scheme: "studentnotes"`, `userInterfaceStyle: "automatic"` y
  `experiments.typedRoutes: true`; plugins para SecureStore y WebBrowser.
- `metro.config.js`: `withUniwindConfig` envuelve la configuración de Metro y
  apunta a `src/global.css`; genera `src/uniwind-types.d.ts` al arrancar Metro.
- `tsconfig.json`: alias `@/*` hacia `src/*` e inclusión de tipos de Expo Router
  y Uniwind.
- `eslint.config.js`: configuración flat de Expo.
- `src/global.css` se importa una sola vez desde `src/app/_layout.tsx` (no desde
  el entry point, para conservar Fast Refresh).

## Scripts

```bash
npm start          # Expo dev server
npm run android    # Abrir en Android
npm run lint       # ESLint
npm run typecheck  # TypeScript estricto
```

## Verificación

```bash
npm run lint
npm run typecheck
npx expo-doctor
```

La primera vez que se arranca Metro se genera `src/uniwind-types.d.ts`. Es
necesario para que TypeScript conozca las clases disponibles.

## Auditoría visual y motion

Mejoras aplicadas en la pasada de experiencia:

- La bienvenida usa una composición abstracta de libreta, sin apuntes de
  ejemplo ni contenido que parezca información real del usuario.
- Las rutas de autenticación usan la misma transición lateral nativa que las
  rutas privadas. El stack protegido ya animaba las pantallas de detalle,
  creación y configuración, por lo que se conservó.
- Los botones tienen una respuesta de escala breve con `Animated` y driver
  nativo. Favoritos, fijado, archivado y opciones de tema tienen feedback de
  pulsación; los cambios optimistas siguen usando la lógica existente.
- Los skeletons tienen un brillo discreto con `Animated` y driver nativo; la
  carga de más resultados reutiliza el mismo placeholder.
- Los estados vacíos ahora priorizan el mensaje y la siguiente acción, y las
  notas distinguen entre listas sin favoritas, fijadas o archivadas.
- El perfil presenta avatar/fallback, proveedor e información de cuenta en un
  bloque visual único; también evita reemplazar el avatar con un botón de error
  durante una recarga fallida. Configuración mantiene sus opciones y destaca
  el acceso a cambio de contraseña.

No se instalaron dependencias: `react-native-reanimated` y
`lottie-react-native` no están declarados en el proyecto. Las animaciones nuevas
usan `Animated` de React Native, son breves y delegan transformaciones al driver
nativo. El fondo Flow Lines continúa estático para evitar trabajo constante en
pantallas de contenido.

### Revisión de `assets/animations/*.json`

| Asset | Composición | Decisión |
| --- | --- | --- |
| `Notas de estudiante.json` | Libreta, 512×512, 3 capas, 2 s | La mejor candidata para bienvenida; no se reproduce sin el paquete Lottie. |
| `not-found-notess.json` | Barco y nubes, 610×495, 8 capas, 2 s | No usar: metáfora visual poco relacionada con notas académicas. |
| `loading.json` | Forma simple, 400×400, 1 capa, 1.5 s | No usar: un spinner genérico es inferior al skeleton contextual. |
| `loading-second.json` | Círculos, 1080×1080, 5 capas, 2 s | No usar: carga genérica y lienzo innecesariamente grande. |
| `comprobación de éxito.json` | Marca de verificación, 500×500, 2 capas, 2 s | Adecuada para éxito si se incorpora Lottie en el futuro; no hay flujo que la necesite ahora. |
| `error.json` | Icono de error, 32×32, 2 capas, 1.4 s | No usar: resolución pequeña y no mejora el mensaje accesible. |
| `archivo doc.json` | Documento, 2160×2160, 5 capas, 3 s | No usar: asset genérico de gran tamaño. |
| `Profile Avatar for Child.json` | Avatar, 400×400, 4 capas, 12 s | No usar: estilo infantil y duración larga para el perfil. |

No se añaden dependencias ni se cambia la configuración de autenticación,
Supabase, OAuth, deep linking o providers en esta auditoría.

## Próximos pasos

1. Validar visualmente en Android real con anchos de 360–430dp y en ambos temas.
2. Añadir pruebas de integración para Auth, recuperación, guardas de rutas y
   operaciones de notas una vez disponible un entorno de Supabase de prueba.
3. Considerar persistir la preferencia del tema sin modificar el flujo actual
   hasta definir almacenamiento y migración.
