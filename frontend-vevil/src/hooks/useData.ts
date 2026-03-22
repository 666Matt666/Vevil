import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, customersApi, invoicesApi, metricsApi } from '../services/api';
import { queryKeys } from './useAuth';

// ============================================
// HOOKS DE PRODUCTOS
// ============================================

/**
 * Hook para obtener todos los productos
 */
export function useProducts(filters?: { search?: string; category?: string }) {
  const queryKey = queryKeys.products(filters ? JSON.stringify(filters) : undefined);
  
  return useQuery({
    queryKey,
    queryFn: () => productsApi.getAll(),
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
}

/**
 * Hook para crear un producto
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

/**
 * Hook para actualizar un producto
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: unknown }) => 
      productsApi.update(id, data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

/**
 * Hook para eliminar un producto
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// ============================================
// HOOKS DE CLIENTES
// ============================================

/**
 * Hook para obtener todos los clientes
 */
export function useCustomers(filters?: { search?: string; department?: string }) {
  const queryKey = queryKeys.customers(filters ? JSON.stringify(filters) : undefined);
  
  return useQuery({
    queryKey,
    queryFn: () => customersApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para crear un cliente
 */
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

/**
 * Hook para actualizar un cliente
 */
export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: unknown }) => 
      customersApi.update(id, data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

/**
 * Hook para eliminar un cliente
 */
export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

// ============================================
// HOOKS DE FACTURAS
// ============================================

/**
 * Hook para obtener todas las facturas
 */
export function useInvoices(filters?: { status?: string; customerId?: string }) {
  const queryKey = queryKeys.invoices(filters ? JSON.stringify(filters) : undefined);
  
  return useQuery({
    queryKey,
    queryFn: () => invoicesApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================
// HOOKS DE MÉTRICAS
// ============================================

/**
 * Hook para obtener métricas del dashboard
 */
export function useMetrics(filters?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: [...queryKeys.metrics, filters],
    queryFn: () => metricsApi.getMetrics(filters),
    staleTime: 2 * 60 * 1000, // 2 min cache para métricas
    refetchInterval: 5 * 60 * 1000, // Auto refetch cada 5 min
  });
}
