# Verificación local antes del deploy a PROD

Antes de hacer push a `main` (sobre todo la primera vez que subís auditoría), conviene probar todo en local. Así evitás sorpresas de noche.

## Opción rápida: script

Desde la raíz del monorepo (`vevil-system`):

```bash
npm run pre-deploy:local
```

Eso levanta Postgres, espera a que esté listo, instala dependencias del backend si hace falta, ejecuta las migraciones y te indica el siguiente paso. Después:

```bash
npm run dev
```

Y seguí el **Checklist en el navegador** más abajo.

---

## Opción manual

1. **Levantar Postgres**
   ```bash
   npm run dev:up
   ```
2. **Esperar a que el puerto 5432 esté disponible** (unos segundos).
3. **Aplicar migraciones**
   ```bash
   npm run db:migrate
   ```
   (Hace build del backend y corre las migraciones contra la base local.)
4. **Levantar backend y frontend**
   ```bash
   npm run dev
   ```
5. **Checklist en el navegador** (abrí http://localhost:5173):

- [ ] **Login** con un usuario (ej. admin@vevil.com / admin123 si lo tenés creado).
- [ ] **Crear un cliente** (Clientes → Nuevo, guardar).
- [ ] **Crear o ver un producto** (Productos).
- [ ] **Crear una factura** (Facturas → Nueva factura, elegir cliente y productos, guardar).
- [ ] **Ir a Auditoría** (menú lateral → Auditoría).
- [ ] **Verificar** que aparecen registros (al menos login y las acciones que hiciste). Probar filtros (Aplicar) y que la tabla se vea bien.

Si todo eso funciona en local, el mismo flujo en PROD (con la base de Supabase) debería funcionar después del deploy.

---

## Si algo falla

- **Migración falla:** Revisá que Postgres esté levantado (`docker ps`) y que no haya otro proceso usando el puerto 5432.
- **Backend no inicia:** Revisá que las variables de entorno (o `.env` en `backend-vevil`) tengan `DB_HOST=localhost`, etc.
- **Auditoría vacía:** Asegurate de haber hecho login y al menos una acción (crear cliente, factura, etc.) antes de entrar a la pantalla Auditoría.

---

**Última actualización:** 2025
