# Services

Capa de acceso a datos. Aquí vivirán Supabase, repositorios y adaptadores de
persistencia local. La UI y los componentes nunca deben importar Supabase de
forma directa.

Estructura sugerida para las siguientes etapas:

```text
services/
├── supabase/
│   ├── client.ts
│   ├── notes.repository.ts
│   └── profiles.repository.ts
└── local/
    └── storage.service.ts
```

No hay ningún proveedor configurado todavía.
