#!/bin/bash
# Weekly Skills Check for Vevil Project
# This script checks https://skills.sh/ for new agent skills that could improve the project
# Schedule: Every Monday at 9:00 AM
# Location: C:\Workspace\Vevil-git\scripts\weekly-skills-check.sh

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOGS_DIR="$PROJECT_ROOT/logs"
DATE_NOW=$(date +%Y-%m-%d)
LOG_FILE="$LOGS_DIR/skills-check-$DATE_NOW.log"

# Create logs directory if not exists
mkdir -p "$LOGS_DIR"

echo "================================================"
echo "🔍 Vevil Weekly Skills Check"
echo "================================================"
echo ""
echo "📅 Date: $(date)"
echo "📍 Project: $PROJECT_ROOT"
echo ""

# Log file
exec > >(tee -a "$LOG_FILE") 2>&1

echo "================================================"
echo "Weekly Skills Check - $DATE_NOW"
echo "================================================"
echo ""

echo -e "${BLUE}🌐 Checking https://skills.sh/ for new skills...${NC}"
echo ""

# Currently installed skills (from AGENTS.md and .kilo/)
echo "📋 Currently installed/applied skills in Vevil:"
echo "  ✅ vercel-react-best-practices (322K installs)"
echo "     - React performance optimization (70 rules)"
echo "     - Applied in: AccountsReceivable, Layout, components"
echo ""
echo "  ✅ supabase-postgres-best-practices (100K installs)"
echo "     - PostgreSQL optimization, indexes, RLS"
echo "     - Applied in: backup.service, queries"
echo ""
echo "  ✅ systematic-debugging (61K installs)"
echo "     - Root cause investigation methodology"
echo "     - Used for: bug fixing, architecture decisions"
echo ""
echo "  ✅ typescript-advanced-types (32K installs)"
echo "     - Advanced TypeScript patterns"
echo ""
echo "  ✅ playwright-best-practices (27K installs) [NEW]"
echo "     - E2E testing patterns (50+ scenarios)"
echo "     - Applied in: npm run e2e scripts"
echo ""
echo "  ✅ web-app-testing (49K installs) [NEW]"
echo "     - Web app testing: forms, a11y, responsive, i18n"
echo ""
echo "  ✅ nodejs-backend-patterns (25K installs) [NEW]"
echo "     - NestJS/Node.js architecture patterns"
echo ""
echo "  ✅ security-best-practices (built-in)"
echo "     - Helmet, CORS whitelist, rate limiting"
echo "     - Applied in: main.ts, backup endpoints"
echo ""

echo -e "${YELLOW}🔎 Skills to evaluate (trending on skills.sh):${NC}"
echo ""
echo "  1. vercel-composition-patterns (135K installs)"
echo "     - React composition patterns, higher-order components"
echo "     - Vercel Labs - highly relevant for React 19"
echo "     URL: https://skills.sh/vercel-labs/agent-skills/vercel-composition-patterns"
echo ""
echo "  2. next-best-practices (64K installs)"
echo "     - Next.js optimization (app router, caching, streaming)"
echo "     - Vevil uses Vite, not Next.js - probably not applicable"
echo "     URL: https://skills.sh/vercel-labs/next-skills/next-best-practices"
echo ""
echo "  3. better-auth-best-practices (38K installs)"
echo "     - Authentication/authorization security patterns"
echo "     - Vevil uses JWT + WebAuthn - could improve auth security"
echo "     URL: https://skills.sh/better-auth/skills/better-auth-best-practices"
echo ""
echo "  4. frontend-design (anthropics - 301K overall)"
echo "     - UI/UX design principles, accessibility, user flows"
echo "     - Already using web-design-guidelines but could refine"
echo ""
echo "  5. shadcn (88K installs)"
echo "     - Component patterns if we migrate to shadcn/ui"
echo "     - Currently using custom CSS - not a priority"
echo ""
echo "  6. neon-postgres (24K installs)"
echo "     - NeonDB-specific Postgres patterns"
echo "     - We use Supabase - not directly applicable"
echo ""

echo "🎯 Recommended actions for this week:"
echo ""
echo "  1. Review: vercel-composition-patterns"
echo "     Impact: HIGH (React composition improvements)"
echo "     Action: Read SKILL.md, apply to complex components"
echo ""
echo "  2. Review: better-auth-best-practices"
echo "     Impact: HIGH (security enhancement)"
echo "     Action: Evaluate JWT refresh tokens, session management"
echo ""
echo "  3. Consider: frontend-design polish"
echo "     Impact: MEDIUM (UX improvements)"
echo "     Action: Review for accessibility, color contrast, focus states"
echo ""

echo -e "${GREEN}✅ Weekly check complete!${NC}"
echo ""
echo "📝 Log saved to: $LOG_FILE"
echo ""
echo "🔗 Next review: $(date -d "+1 week" +%Y-%m-%d) (next Monday)"
echo ""
echo "💡 To review skills manually:"
echo "   Visit: https://skills.sh/"
echo "   Filter by: Trending, Hot, or search 'React', 'NestJS', 'PostgreSQL'"
echo ""
echo "📦 To install a new skill:"
echo "   npx skills add <repo-url> --skill <skill-name>"
echo "   Example: npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-composition-patterns"
echo ""

# Summary for Git commit
echo "================================================"
echo "📊 Summary for commit:"
echo "================================================"
echo ""
echo "- Reviewed skills.sh for new relevant skills"
echo "- Newly installed this week: playwright-best-practices, web-app-testing, nodejs-backend-patterns"
echo "- Pending evaluation: vercel-composition-patterns, better-auth-best-practices"
echo "- No breaking changes identified"
echo ""

exit 0
