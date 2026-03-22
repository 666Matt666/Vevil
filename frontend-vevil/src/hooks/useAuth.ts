import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, login as apiLogin, clearTokens as apiLogout, register as apiRegister, pendingRegistrationsApi } from '../services/api';
import type { LoginCredentials, RegisterData, LoginResponse } from '../types';

// ============================================
// CONFIGURACIÓN DE CACHE
// ============================================

// Tiempo de cache en milisegundos (5 minutos)
const STALE_TIME = 5 * 60 * 1000;

// Keys para React Query
export const queryKeys = {
  profile: ['profile'] as const,
  pendingRegistrations: ['pendingRegistrations'] as const,
  pendingCount: ['pendingCount'] as const,
  products: (filters?: string) => ['products', filters] as const,
  customers: (filters?: string) => ['customers', filters] as const,
  invoices: (filters?: string) => ['invoices', filters] as const,
  metrics: ['metrics'] as const,
};

// ============================================
// HOOKS DE AUTENTICACIÓN
// ============================================

/**
 * Hook para obtener el perfil del usuario con cache
 * Usa staleTime para evitar llamadas repetidas en 5 minutos
 */
export function useProfile(options?: { refetchOnMount?: boolean }) {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: getProfile,
    staleTime: STALE_TIME, // Cache por 5 minutos
    gcTime: 30 * 60 * 1000, // Garbage collection en 30 minutos
    retry: 1, // Un solo reintento
    refetchOnWindowFocus: false, // No refetch al volver a la ventana
    refetchOnMount: options?.refetchOnMount ?? false, // Por defecto no refetch al montar
  });
}

/**
 * Hook para el login con invalidación de cache
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials): Promise<LoginResponse> => 
      apiLogin(credentials.email, credentials.password),
    onSuccess: () => {
      // Invalidar cache de profile para forzar refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}

/**
 * Hook para el logout con limpieza de cache
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiLogout,
    onSuccess: () => {
      // Limpiar todo el cache
      queryClient.clear();
    },
  });
}

/**
 * Hook para el registro
 */
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterData) => apiRegister(data.name, data.email, data.password),
    onSuccess: () => {
      // Invalidar cache de registros pendientes
      queryClient.invalidateQueries({ queryKey: queryKeys.pendingRegistrations });
      queryClient.invalidateQueries({ queryKey: queryKeys.pendingCount });
    },
  });
}

// ============================================
// HOOKS DE REGISTROS PENDIENTES
// ============================================

/**
 * Hook para obtener el conteo de registros pendientes
 * Se refresca automáticamente cada 60 segundos
 */
export function usePendingCount() {
  return useQuery({
    queryKey: queryKeys.pendingCount,
    queryFn: () => pendingRegistrationsApi.getCount(),
    staleTime: 30 * 1000, // Cache por 30 segundos
    gcTime: 5 * 60 * 1000, // GC en 5 minutos
    refetchInterval: 60 * 1000, // Auto refetch cada 60 segundos
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook para obtener la lista de registros pendientes
 */
export function usePendingRegistrations() {
  return useQuery({
    queryKey: queryKeys.pendingRegistrations,
    queryFn: () => pendingRegistrationsApi.getList(),
    staleTime: STALE_TIME,
  });
}

/**
 * Hook para aprobar un registro
 */
export function useApproveRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'admin' | 'user' }) =>
      pendingRegistrationsApi.approve(id, role),
    onSuccess: () => {
      // Refrescar ambas listas
      queryClient.invalidateQueries({ queryKey: queryKeys.pendingRegistrations });
      queryClient.invalidateQueries({ queryKey: queryKeys.pendingCount });
    },
  });
}

// ============================================
// UTILIDADES DE ERROR
// ============================================

/**
 * Hook para obtener el estado de error de manera consistente
 */
export function useErrorMessage() {
  return (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'Ha ocurrido un error inesperado';
  };
}

/**
 * Custom hook para manejar errores de red
 */
export function useNetworkErrorHandler() {
  const handleNetworkError = (error: unknown): string => {
    const message = useErrorMessage()(error);
    
    // Detectar errores comunes de red
    if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
      return 'No se pudo conectar al servidor. Verificá tu conexión a internet.';
    }
    
    if (message.includes('timeout') || message.includes('timed out')) {
      return 'El servidor tardó demasiado en responder. Intentá de nuevo en unos segundos.';
    }
    
    if (message.includes('500') || message.includes('Internal Server Error')) {
      return 'Error del servidor. Intentá más tarde.';
    }
    
    if (message.includes('401') || message.includes('Unauthorized')) {
      return 'Tu sesión ha expirado. Iniciá sesión nuevamente.';
    }
    
    if (message.includes('403') || message.includes('Forbidden')) {
      return 'No tenés permiso para realizar esta acción.';
    }
    
    return message;
  };

  return { handleNetworkError };
}
