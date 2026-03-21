import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import apiClient from '@/api/axios';
import { clearTokens } from '@/services/api';

export interface User {
  id: string;
  name: string;
  email: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  // Ya no necesitamos token local - usamos HttpOnly cookies
  // isAuthenticated se determina verificando con el servidor

  // Un getter computado que nos dice si el usuario está realmente autenticado
  // Ahora depende de si tenemos usuario cargado (verificado con el servidor)
  const isAuthenticated = computed(() => !!user.value);

  function clearAuth() {
    console.log('[AUTH] Clearing auth, user:', user.value);
    user.value = null;
    // Ya no usamos localStorage para el token
  }

  async function fetchProfile() {
    // Intentar obtener el perfil usando las cookies HttpOnly
    console.log('[AUTH] fetchProfile: Starting...');
    try {
      const response = await apiClient.get<User>('/auth/profile');
      console.log('[AUTH] fetchProfile: Success, user:', response.data);
      user.value = response.data;
      return true;
    } catch (error: any) {
      // Si no podemos obtener el perfil, no hay sesión activa
      console.error('[AUTH] fetchProfile: Failed', error?.response?.status, error?.message);
      user.value = null;
      return false;
    }
  }

  async function login(email: string, password: string) {
    console.log('[AUTH] login: Starting for email:', email);
    // El login ahora usa cookies HttpOnly - no necesitamos guardar token
    await apiClient.post('/auth/login', { email, password });
    console.log('[AUTH] login: API call successful');
    // Después del login exitoso, obtenemos el perfil
    const success = await fetchProfile();
    if (!success) {
      console.error('[AUTH] login: fetchProfile failed');
      throw new Error('Login failed');
    }
    console.log('[AUTH] login: Complete, user:', user.value);
  }

  async function logout() {
    console.log('[AUTH] logout: Starting...');
    // Llamar al servidor para invalidar las cookies
    await clearTokens();
    clearAuth();
    console.log('[AUTH] logout: Complete');
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
    fetchProfile, // Exponemos fetchProfile para usarlo al inicio de la app
  };
}
);