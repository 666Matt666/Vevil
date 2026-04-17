# Guía de Contribución – Vevil System

¡Gracias por querer contribuir a Vevil! Por favor, leé esta guía antes de abrir un PR.

## 📋 Índice

1. [Cómo contribuir](#cómo-contribuir)
2. [Flujo de trabajo con Git](#flujo-de-trabajo-con-git)
3. [Convenciones de commits](#convenciones-de-commits)
4. [Requisitos antes de hacer PR](#requisitos-antes-de-hacer-pr)
5. [Pull Request Template](#pull-request-template)
6. [Code Review](#code-review)
7. [Preguntas frecuentes](#preguntas-frecuentes)

---

## Cómo contribuir

### Tipos de contribución

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| **🐛 Bug fix** | Corrección de errores | `fix: corregir cálculo de total en facturas con descuento` |
| **✨ Feature** | Nueva funcionalidad | `feat: agregar reporte de stock por categoría` |
| **📚 Docs** | Mejora de documentación | `docs: actualizar README con deploy en Render` |
| **🧹 Refactor** | Mejora de código sin cambiar comportamiento | `refactor: simplificar lógica de validación en DTOs` |
| **✅ Test** | Agregar/mejorar tests | `test: agregar cobertura para InvoiceService` |
| **🔧 Chore** | Tareas técnicas (build, deps, CI) | `chore: actualizar dependencias de ESLint` |

---

## Flujo de trabajo con Git

### 1. Clonar y configurar

```bash
git clone https://github.com/666Matt666/Vevil.git
cd vevil-system
npm install
cd backend-vevil && npm install && cd ..
cd frontend-vevil && npm install && cd ..
```

### 2. Crear rama desde `develop` (o `main` si no hay `develop`)

```bash
git checkout develop   # o main
git pull origin develop
git checkout -b feat/mi-nueva-feature
```

**Naming de ramas:**
- `feat/` – nuevas funcionalidades
- `fix/` – correcciones de bugs
- `docs/` – documentación
- `refactor/` – refactorización
- `test/` – tests
- `chore/` – mantenimiento

### 3. Desarrollar

- Escribí código siguiendo las [best practices](AGENTS.md).
- Hacé commitspequeños y descriptivos.
- Corré tests localmente antes de commitear.

```bash
npm run test:backend
npm run test:frontend
npm run lint:backend
npm run lint:frontend
npm run typecheck
```

### 4. Commit

```bash
git add .
git commit -m "feat: agregar filtro de productos por categoría"
```

---

## Convenciones de commits

Usamos **Conventional Commits**:

```
<tipo>(<alcance>): <descripción>

[ cuerpo opcional ]

[ pie de página opcional ]
```

### Tipos

- `feat` – nueva funcionalidad (minor version bump)
- `fix` – corrección de bug (patch version bump)
- `docs` –(documentación)
- `style` – cambios de formato (no afectan funcionalidad)
- `refactor` – refactorización de código
- `test` – agregar o corregir tests
- `chore` – mantenimiento (deps, CI, build)

### Ejemplos

```bash
feat(invoices): agregar endpoint para generar facturas CSV
fix(auth): corregir validación de token en refresh
docs: actualizar guía de deploy en Render
test(products): agregar tests unitarios para ProductService
refactor(ui): simplificar lógica de paginación
```

---

## Requisitos antes de hacer PR

### Mínimo obligatorio

- [ ] Tests unitarios pasan (backend: 138/138, frontend: 27/27)
- [ ] Build compila sin errores (`npm run typecheck`)
- [ ] Lint sin errores en archivos modificados
- [ ] Commits siguen conventional format
- [ ] Documentación actualizada si hay cambios de UX/API

### Ideal (revisión por pares)

- [ ] Código revisado por al menos 1 maintainer
- [ ] Tests de integración/E2E actualizados si corresponde
- [ ] CHANGELOG.md actualizado (sección "En Desarrollo")
- [ ] Screenshots/GIFs en PR si es UI/UX

---

## Pull Request Template

```markdown
## 📝 Descripción

Breve descripción del cambio. ¿Qué problema resuelve? ¿Por qué es necesario?

## 🔗 Related Issues

Closes #123
Relates to #456

## ✅ Checklist

- [ ] Tests unitarios pasan (corrí `npm run test:backend` y `npm run test:frontend`)
- [ ] Build compila sin errores (`npm run typecheck`)
- [ ] Lint aplica sin errores en archivos modificados
- [ ] Documentación actualizada (README, docs/, CHANGELOG)
- [ ] No quedaron `console.log` o `debugger`
- [ ] Commits siguen [Conventional Commits](https://www.conventionalcommits.org/)
- [ ] No introduje breaking changes (o los documenté claramente)

## 🧪 Cómo probar

Pasos para reproducir y validar el cambio:

1. `git checkout feat/mi-rama`
2. `npm run dev`
3. Ir a http://localhost:5173
4. Hacer X, Y, Z
5. Verificar que A, B, C funcionan

## 📸 Screenshots / GIFs (si aplica)

_Agregar screenshots si el PR cambia UI/UX._

## 🔍 Notas para el revisor

_Indicar qué archivos/clases revisar, dudas, etc._

```

---

## Code Review

### Para autores

- Respondé comentarios de manera constructiva.
- Si no estás de acuerdo, explicá tu razonamiento con evidencia técnica.
- Hacé push de cambios en commitspequeños (evita commits masivos "fix review").

### Para revisores

- Sé específico: en vez de "esto está mal", decir "línea 45: ¿por qué usás `any` en lugar de `InvoiceDto`?"
- Sugerí alternativas, no solo señalar problemas.
- Aprobá solo si:
  - Tests pasan
  - No hay bugs obvios
  - Código es legible y maintainable

---

## Preguntas frecuentes

### ¿Puedo usar `feat:` para changes que no son visibles al usuario?

Sí, `feat` también incluye mejoras internas significativas (ej: agregar logger estructurado). Para cambios menores de infraestructura usá `chore`.

### ¿Qué hago si mis tests fallan en CI pero en local pasan?

Chequeá:
- Versión de Node.js (CI usa Node 24, local podrías tener otra)
- Variables de entorno (CI puede no tener `.env`)
- Race conditions (Agregá `--runInBand` a Jest)

### ¿Cómoactualizo el CHANGELOG?

Agregá una entrada bajo `[En Desarrollo]` con el tipo de cambio:

```markdown
### 🛠 Mejoras
- **Backend**: Agregado endpoint para exportar facturas a PDF

### 🐛 Correcciones
- **Frontend**: Corregido error de redimensionamiento en tabla de productos
```

### ¿Dónde discuto una idea grande antes de codear?

Abrí un [GitHub Discussion](https://github.com/666Matt666/Vevil/discussions) o un issue con label `enhancement`. ¡Evita worked duplicado!

### Mi PR introduce breaking changes, ¿cómo lo documento?

Agregá en la descripción del PR:

```markdown
## ⚠ Breaking Changes

- Campo `user.email` pasa a ser `user.contactEmail` (migración requerida)
- Endpoint `/api/invoices` cambia respuesta: ahora incluye `totalWithTax`
```

Y actualizá `CHANGELOG.md` en sección `### ⚠ Breaking Changes`.

---

## 🏆 Reconocimiento

Los contribuyentes aparecen en:
- `CHANGELOG.md` (si el cambio es significativo)
- README badges (stats de contribución)
- Releases en GitHub

---

**¿Listo?** Hacé fork, creá tu rama y abrí tu PR. ¡Gracias por contribuir! 🚀
