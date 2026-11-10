# Store

Estado global de cliente. La preferencia de tema se gestiona actualmente con
`ThemeProvider` y su API `setMode`, que ya permite una futura pantalla de
configuración.

Cuando aparezcan sesión, filtros o borradores, este es el lugar para el store.
Mantén el estado de servidor (notas, perfil) en la capa de servicios/caché y no
lo dupliques aquí.

No se ha añadido una librería de estado para evitar dependencias prematuras.
