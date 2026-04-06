# ===============================================
# SCRIPT PARA INICIAR DESARROLLO CON SUPABASE
# ===============================================
# Este script permite desarrollar localmente apuntando a Supabase

# Pasos:
# 1. Backend usa .env.production.local (ya configurado)
# 2. Frontend usa .env.local (apunta a localhost:3000)
# 3. Ambos apuntan al mismo backend que conecta a Supabase

echo "=========================================="
echo "Vevil - Desarrollo Local con Supabase"
echo "=========================================="
echo ""
echo "Configuracion actual:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:3000 -> Supabase"
echo ""
echo "Para ejecutar:"
echo "  1. Backend: cd backend-vevil && npm run start:dev"
echo "  2. Frontend: cd frontend-vevil && npm run dev"
echo ""
echo "NOTA: Las migraciones no se ejecutaran automaticamente."
echo "      Ejecuta manualmente si necesitas actualizar el schema:"
echo "      npm run migration:run:prod --prefix backend-vevil"