import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// ============================================
// CONFIGURACIÓN DEL CLIENTE DE REACT QUERY
// ============================================

/**
 * Cliente de React Query con configuración optimizada
 * 
 * Configuración:
 * - defaultOptions: Defines opciones por defecto para todas las queries/mutations
 * - queries: Configuración para todas las petitions HTTP
 * - mutations: Configuración para todas las mutaciones
 * 
 * Beneficios:
 * - staleTime: Evita refetching innecesario (5 min por defecto)
 * - gcTime: Limpia el cache después de 30 min de inactividad
 * - retry: Reintenta automáticamente 1 vez en caso de error
 * - refetchOnWindowFocus: Evita refetch al volver a la pestaña
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tiempo hasta que los datos se consideran "stale" (no frescos)
      // Durante este tiempo, no se har nuevos requests
      staleTime: 5 * 60 * 1000, // 5 minutos
      
      // Tiempo hasta que el cache se limpia (garbage collection)
      // Si no se usa la query en este tiempo, se elimina del cache
      gcTime: 30 * 60 * 1000, // 30 minutos
      
      // Nmero de reintentos en caso de error
      retry: 1,
      
      // No refetchear cuando se vuelve a la ventana del navegador
      // Esto evita llamadas innecesarias al cambiar de pestaña
      refetchOnWindowFocus: false,
      
      // No refetchear al reconectar (por ejemplo, cuando vuelve el wifi)
      refetchOnReconnect: false,
    },
    mutations: {
      // Reintentos para mutations (por defecto 0 para mutations)
      retry: 0,
    },
  },
});

/**
 * Tipos para el children del provider
 */
interface QueryProviderProps {
  children: ReactNode;
}

/**
 * Componente Provider que envuelve la aplicación
 * Debe ser usado en el punto ms alto de la aplicacin (main.tsx)
 * 
 * Uso:
 * <QueryProvider>
 *   <App />
 * </QueryProvider>
 */
export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
