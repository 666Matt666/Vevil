# Cursor Skills

Skills descargados para usarlos en Cursor. Cada skill tiene su **regla separada** en **`.cursor/rules/`**.

## Contenido

### microservices-architect/
Skill de [jeffallan/claude-skills](https://github.com/Jeffallan/claude-skills).

- `SKILL.md` - Definición del rol, flujo, restricciones y referencias
- `references/` - decomposition, communication, patterns, data, observability

**Regla en Cursor:** `.cursor/rules/microservices-architect.mdc`

### java-microservices/
Skill de [pluginagentmarketplace/custom-plugin-java](https://github.com/pluginagentmarketplace/custom-plugin-java).

- `SKILL.md` - Spring Cloud, Resilience4j, Kafka, Saga, observabilidad
- `references/` - GUIDE.md, PATTERNS.md
- `assets/` - schema, config (si aplica)

**Regla en Cursor:** `.cursor/rules/java-microservices.mdc` (se aplica en `**/*.java`, `**/pom.xml`, `**/application*.yml`, etc.)

### microservices-architecture-aj-geddes/
Skill de [aj-geddes/useful-ai-prompts](https://github.com/aj-geddes/useful-ai-prompts).

- `SKILL.md` - Guía de arquitectura: DDD, REST/gRPC, API gateway, service discovery, Saga, event sourcing, Istio, BFF, sidecar

**Regla en Cursor:** `.cursor/rules/microservices-architecture.mdc` (se aplica en `**/*.ts`, `**/*.js`, `**/proto/**`, `**/*.yaml`, Docker, etc.)

---

## Skills desde [skills.sh](https://skills.sh/) (aplicados a este proyecto)

### supabase-postgres-best-practices/
Skill de [supabase/agent-skills](https://github.com/supabase/agent-skills) – [skills.sh](https://skills.sh/supabase/agent-skills/supabase-postgres-best-practices).

- `SKILL.md` + `references/` – Query performance, connection management, RLS, schema, locking, data patterns, monitoring
- **Regla:** `.cursor/rules/supabase-postgres-best-practices.mdc` (globs: `**/*.sql`, `**/migrations/**`, `**/*entity*.ts`, etc.)

### vercel-react-best-practices/
Skill de [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) – [skills.sh](https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices).

- `SKILL.md` + `rules/` – Waterfalls, bundle size, server/client fetching, re-renders, rendering, JS performance
- **Regla:** `.cursor/rules/vercel-react-best-practices.mdc` (globs: `**/*.tsx`, `**/*.jsx`, `**/components/**`, etc.)

### vite-antfu/
Skill de [antfu/skills](https://github.com/antfu/skills) – [skills.sh](https://skills.sh/antfu/skills/vite).

- `SKILL.md` + `references/` – Config, plugin API, build, SSR, environment API, Rolldown
- **Regla:** `.cursor/rules/vite-antfu.mdc` (globs: `**/vite.config.*`, `**/vitest.config.*`, etc.)

### nodejs-backend-patterns/
Skill de [wshobson/agents](https://github.com/wshobson/agents) – [skills.sh](https://skills.sh/wshobson/agents/nodejs-backend-patterns).

- `SKILL.md` – Express/Fastify, middleware, auth, DB, REST/GraphQL, WebSockets, jobs
- **Regla:** `.cursor/rules/nodejs-backend-patterns.mdc` (globs: `**/src/**/*.ts`, `**/*.controller.ts`, `**/*.service.ts`, etc.)

### api-design-principles/
Skill de [wshobson/agents](https://github.com/wshobson/agents) – [skills.sh](https://skills.sh/wshobson/agents/api-design-principles).

- `SKILL.md` + `references/` + `assets/` – REST, GraphQL, versionado, documentación
- **Regla:** `.cursor/rules/api-design-principles.mdc` (globs: `**/*.controller.ts`, `**/api/**`, `**/*.graphql`, etc.)

### web-design-guidelines/
Skill de [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) – [skills.sh](https://skills.sh/vercel-labs/agent-skills/web-design-guidelines).

- Revisar UI contra Web Interface Guidelines, accesibilidad, UX
- **Regla:** `.cursor/rules/web-design-guidelines.mdc` (globs: `**/*.tsx`, `**/*.html`, `**/components/**`, etc.)

### security-best-practices/
Skill de [supercent-io/skills-template](https://github.com/supercent-io/skills-template) – [skills.sh](https://skills.sh/supercent-io/skills-template/security-best-practices).

- HTTPS, CORS, XSS, SQL injection, CSRF, rate limiting, OWASP Top 10
- **Regla:** `.cursor/rules/security-best-practices.mdc` (globs: controllers, main, middleware, auth, api, config)

### systematic-debugging/
Skill de [obra/superpowers](https://github.com/obra/superpowers) – [skills.sh](https://skills.sh/obra/superpowers/systematic-debugging).

- Encontrar causa raíz antes de proponer fixes; 4 fases (investigation → hypothesis → verify → fix)
- **Regla:** `.cursor/rules/systematic-debugging.mdc` (globs: `**/*.spec.*`, `**/*.test.*`, `**/*.ts`, `**/*.js`)

### webapp-testing/
Skill de [anthropics/skills](https://github.com/anthropics/skills) – [skills.sh](https://skills.sh/anthropics/skills/webapp-testing).

- Playwright para apps web locales, with_server.py, reconnaissance-then-action
- **Regla:** `.cursor/rules/webapp-testing.mdc` (globs: e2e, tests, playwright, with_server)

### typescript-advanced-types/
Skill de [wshobson/agents](https://github.com/wshobson/agents) – [skills.sh](https://skills.sh/wshobson/agents/typescript-advanced-types).

- Generics, conditional/mapped/template literal types, utility types
- **Regla:** `.cursor/rules/typescript-advanced-types.mdc` (globs: `**/*.ts`, `**/*.tsx`, `**/types/**`, etc.)

## Cómo está aplicado en Cursor

- **`.cursorrules`** (raíz del proyecto): índice que apunta a `.cursor/rules/` y a esta carpeta de docs.
- **`.cursor/rules/*.mdc`**: una regla por skill; Cursor las carga automáticamente. Cada regla tiene `description` y opcionalmente `globs` para activarse en ciertos archivos.

No hace falta activar nada: Cursor lee `.cursorrules` y todo lo que haya en `.cursor/rules/`.

## Actualizar los skills

### microservices-architect
```powershell
cd c:\Workspace\Vevil\vevil-system\docs\cursor-skills
git clone --depth 1 https://github.com/Jeffallan/claude-skills.git temp-skills
Remove-Item -Recurse -Force microservices-architect
Copy-Item -Recurse temp-skills\skills\microservices-architect .
Remove-Item -Recurse -Force temp-skills
```

### java-microservices
```powershell
cd c:\Workspace\Vevil\vevil-system\docs\cursor-skills
git clone --depth 1 https://github.com/pluginagentmarketplace/custom-plugin-java.git temp-java
Remove-Item -Recurse -Force java-microservices
Copy-Item -Recurse temp-java\skills\java-microservices .
Remove-Item -Recurse -Force temp-java
```

### microservices-architecture (aj-geddes)
```powershell
cd c:\Workspace\Vevil
git clone --depth 1 https://github.com/aj-geddes/useful-ai-prompts.git temp-ai-prompts
Remove-Item -Recurse -Force vevil-system\docs\cursor-skills\microservices-architecture-aj-geddes
New-Item -ItemType Directory -Force -Path vevil-system\docs\cursor-skills\microservices-architecture-aj-geddes
Copy-Item temp-ai-prompts\skills\microservices-architecture\SKILL.md vevil-system\docs\cursor-skills\microservices-architecture-aj-geddes\
Remove-Item -Recurse -Force temp-ai-prompts
```

### supabase-postgres-best-practices (skills.sh)
```powershell
cd c:\Workspace\Vevil
git clone --depth 1 https://github.com/supabase/agent-skills.git temp-supabase-skills
Remove-Item -Recurse -Force vevil-system\docs\cursor-skills\supabase-postgres-best-practices
Copy-Item -Recurse temp-supabase-skills\skills\supabase-postgres-best-practices vevil-system\docs\cursor-skills\
Remove-Item -Recurse -Force temp-supabase-skills
```

### vercel-react-best-practices (skills.sh)
```powershell
git clone --depth 1 https://github.com/vercel-labs/agent-skills.git temp-vercel-skills
Remove-Item -Recurse -Force vevil-system\docs\cursor-skills\vercel-react-best-practices
Copy-Item -Recurse temp-vercel-skills\skills\react-best-practices vevil-system\docs\cursor-skills\vercel-react-best-practices
Remove-Item -Recurse -Force temp-vercel-skills
```

### vite (antfu, skills.sh)
```powershell
git clone --depth 1 https://github.com/antfu/skills.git temp-antfu-skills
Remove-Item -Recurse -Force vevil-system\docs\cursor-skills\vite-antfu
Copy-Item -Recurse temp-antfu-skills\skills\vite vevil-system\docs\cursor-skills\vite-antfu
Remove-Item -Recurse -Force temp-antfu-skills
```

### nodejs-backend-patterns y api-design-principles (wshobson, skills.sh)
```powershell
git clone --depth 1 https://github.com/wshobson/agents.git temp-wshobson-agents
Remove-Item -Recurse -Force vevil-system\docs\cursor-skills\nodejs-backend-patterns, vevil-system\docs\cursor-skills\api-design-principles
Copy-Item -Recurse temp-wshobson-agents\plugins\javascript-typescript\skills\nodejs-backend-patterns vevil-system\docs\cursor-skills\
Copy-Item -Recurse temp-wshobson-agents\plugins\backend-development\skills\api-design-principles vevil-system\docs\cursor-skills\
Remove-Item -Recurse -Force temp-wshobson-agents
```

### web-design-guidelines (skills.sh)
```powershell
git clone --depth 1 https://github.com/vercel-labs/agent-skills.git temp-vercel2
Remove-Item -Recurse -Force vevil-system\docs\cursor-skills\web-design-guidelines
Copy-Item -Recurse temp-vercel2\skills\web-design-guidelines vevil-system\docs\cursor-skills\
Remove-Item -Recurse -Force temp-vercel2
```

### security-best-practices (skills.sh)
```powershell
git clone --depth 1 https://github.com/supercent-io/skills-template.git temp-supercent
Remove-Item -Recurse -Force vevil-system\docs\cursor-skills\security-best-practices
Copy-Item -Recurse temp-supercent\.agent-skills\security-best-practices vevil-system\docs\cursor-skills\
Remove-Item -Recurse -Force temp-supercent
```

### systematic-debugging (skills.sh)
```powershell
git clone --depth 1 https://github.com/obra/superpowers.git temp-obra
Remove-Item -Recurse -Force vevil-system\docs\cursor-skills\systematic-debugging
Copy-Item -Recurse temp-obra\skills\systematic-debugging vevil-system\docs\cursor-skills\
Remove-Item -Recurse -Force temp-obra
```

### webapp-testing (skills.sh)
```powershell
git clone --depth 1 https://github.com/anthropics/skills.git temp-anthropics
Remove-Item -Recurse -Force vevil-system\docs\cursor-skills\webapp-testing
Copy-Item -Recurse temp-anthropics\skills\webapp-testing vevil-system\docs\cursor-skills\
Remove-Item -Recurse -Force temp-anthropics
```

### typescript-advanced-types (skills.sh)
```powershell
git clone --depth 1 https://github.com/wshobson/agents.git temp-wshobson2
Remove-Item -Recurse -Force vevil-system\docs\cursor-skills\typescript-advanced-types
Copy-Item -Recurse temp-wshobson2\plugins\javascript-typescript\skills\typescript-advanced-types vevil-system\docs\cursor-skills\
Remove-Item -Recurse -Force temp-wshobson2
```

## Licencias

- microservices-architect: MIT - https://github.com/Jeffallan
- java-microservices: ver repo pluginagentmarketplace/custom-plugin-java
- microservices-architecture (aj-geddes): ver repo https://github.com/aj-geddes/useful-ai-prompts
- supabase-postgres-best-practices: MIT - https://github.com/supabase/agent-skills
- vercel-react-best-practices: MIT - https://github.com/vercel-labs/agent-skills
- vite (antfu): ver https://github.com/antfu/skills
- nodejs-backend-patterns, api-design-principles, typescript-advanced-types: ver https://github.com/wshobson/agents
- web-design-guidelines: MIT - https://github.com/vercel-labs/agent-skills
- security-best-practices: ver https://github.com/supercent-io/skills-template
- systematic-debugging: ver https://github.com/obra/superpowers
- webapp-testing: ver LICENSE.txt en skill - https://github.com/anthropics/skills
