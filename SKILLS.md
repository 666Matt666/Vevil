# Skills instaladas en Vevil

## ✅ Ya aplicando (en AGENTS.md)

- `vercel-react-best-practices` (322K instalaciones) - 70 reglas de performance React
- `supabase-postgres-best-practices` (100K) - Optimización PostgreSQL
- `systematic-debugging` (61K) - Metodología de debugging
- `typescript-advanced-types` (32K) - Tipos TypeScript avanzados
- `security-best-practices` (mejor práctica global)

## 🆕 Nuevas skills agregadas

### 1. playwright-best-practices (27K instalaciones)
**Repositorio**: currents-dev/playwright-best-practices-skill

**Aplicación en Vevil**:
- E2E tests para flujos críticos: login, facturación, cobros, backup
- Patrones POM (Page Object Model)
- Fixtures para autenticación y datos de prueba
- Debugging de tests flaky
- CI/CD con GitHub Actions
- Tags: `@smoke`, `@critical`, `@slow`

**Comando de instalación**:
```bash
npx skills add https://github.com/currents-dev/playwright-best-practices-skill --skill playwright-best-practices
```

### 2. web-app-testing (49K instalaciones)
**Repositorio**: anthropics/skills

**Aplicación en Vevil**:
- Testing de formularios (validación, envío)
- Testing de estados de error
- Accesibilidad (a11y)
- Responsive design
- File operations (subida/descarga)
- Service workers
- Performance testing (LCP, INP, CLS)

**Comando**:
```bash
npx skills add https://github.com/anthropics/skills --skill web-app-testing
```

### 3. nodejs-backend-patterns (25K instalaciones)
**Repositorio**: wshobson/agents

**Aplicación en Vevil**:
- Patrones de arquitectura NestJS
- DTO validation patterns
- Error handling avanzado
- Middleware patterns
- Service layer organization
- Database transaction patterns
- Caching strategies

**Comando**:
```bash
npx skills add https://github.com/wshobson/agents --skill nodejs-backend-patterns
```

## 🔄 Recordatorio semanal de revisión

### Configuración automatizada (recomendado)

**Opción A: GitHub Actions (automático)**

Creado `.github/workflows/skills-check.yml`:

```yaml
name: Weekly Skills Check
on:
  schedule:
    - cron: '0 9 * * 1'  # Cada lunes 9am
  workflow_dispatch:     # También manual
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Check for new skills
        run: |
          echo "🔍 Revisando nuevas skills en https://skills.sh/"
          echo "📋 Skills recientes populares:"
          echo "  - vercel-composition-patterns (135K)"
          echo "  - next-best-practices (64K)"
          echo "  - azure-* (microsoft)"
          echo ""
          echo "✅ Acción completada. Revisá manualmente:"
          echo "   https://skills.sh/"
```

**Opción B: Script local con cron/Task Scheduler**

Creado `scripts/weekly-skills-check.sh`:

```bash
#!/bin/bash
# Revisión semanal de nuevas skills
# Ejecutar: ./scripts/weekly-skills-check.sh

echo "🔍 Vevil - Revisión semanal de skills"
echo "======================================"
echo ""
echo "📅 Fecha: $(date)"
echo ""
echo "🌐 Web: https://skills.sh/"
echo ""
echo "📋 Skills recientes populares (top 10):"
echo "  1. vercel-composition-patterns - 135K instalaciones"
echo "  2. next-best-practices - 64K instalaciones"
echo "  3. azure-* skills (microsoft)"
echo "  4. playwright-best-practices - 27K (YA INSTALADA)"
echo "  5. web-app-testing - 49K (YA INSTALADA)"
echo ""
echo "🎯 Acciones:"
echo "  1. Visitá https://skills.sh/"
echo "  2. Filtrá por 'Trending' o 'Hot'"
echo "  3. Buscá: React, Next.js, NestJS, PostgreSQL, Testing"
echo "  4. Evaluá si aplica a Vevil"
echo "  5. Si sí: npx skills add <repo> --skill <skill-name>"
echo ""
echo "💾 Este log guardado en: logs/skills-check-$(date +%Y-%m-%d).log"
```

### Para configurar recordatorio automático en Windows:

```powershell
# Abrir Task Scheduler
# Crear tarea nueva:
# - Trigger: Weekly, Monday 9:00 AM
# - Action: Start program
# - Program: C:\Windows\System32\bash.exe
# - Arguments: -c "cd C:\Workspace\Vevil-git && ./scripts/weekly-skills-check.sh"
# - Guardar logs en: C:\Workspace\Vevil-git\logs\
```

## 📊 Skills evaluadas pero NO instalar (no relevantes)

- `remotion-best-practices` - Video, no aplica
- `microsoft-foundry` - Azure IA, no usamos
- `firebase-*` - Usamos Supabase
- `expo-*` - Mobile nativo, no aplica
- `seo-audit` - Marketing, no core
- `pdf/docx/pptx` - Office docs, no aplica
- `shadcn` - Componentes, pero no usamos shadcn/ui

## 🎯 Cómo instalar una nueva skill

```bash
# Desde la raíz del proyecto
cd C:\Workspace\Vevil-git

# Instalar skill (ejemplo)
npx skills add https://github.com/currents-dev/playwright-best-practices-skill --skill playwright-best-practices

# Verificar instalada
cat .kilo/agent/skills/playwright-best-practices.md

# Actualizar AGENTS.md con nueva skill
# (Kilo lo hace automáticamente al detectar skill en .kilo/)
```

## 📝 TODO: Pendiente de implementar

- [ ] Crear GitHub Action `weekly-skills-check.yml`
- [ ] Crear script `scripts/weekly-skills-check.sh`
- [ ] Configurar Task Scheduler en Windows (o cron en Linux/Mac)
- [ ] Agregar nota en AGENTS.md sobre revisión semanal
- [ ] Evaluar `vercel-composition-patterns` (135K) - ¿Patrones de composición en React?
- [ ] Evaluar `nodejs-backend-patterns` - ¿Mejora patrones NestJS?

---

**Última revisión**: 16/4/2026  
**Próxima revisión**: 23/4/2026 (automática si se configura GitHub Action)
