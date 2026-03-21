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
    user.value = null;
    // Ya no usamos localStorage para el token
  }

  async function fetchProfile() {
    // Intentar obtener el perfil usando las cookies HttpOnly
    try {
      const response = await apiClient.get<User>('/auth/profile');
      user.value = response.data;
      return true;
    } catch (error) {
      // Si no podemos obtener el perfil, no hay sesión activa
      console.error('Failed to fetch profile, user might not be authenticated.', error);
      user.value = null;
      return false;
    }
  }

  async function login(email: string, password: string) {
    // El login ahora usa cookies HttpOnly - no necesitamos guardar token
    await apiClient.post('/auth/login', { email, password });
    // Después del login exitoso, obtenemos el perfil
    const success = await fetchProfile();
    if (!success) {
      throw new Error('Login failed');
    }
  }

  async function logout() {
    // Llamar al servidor para invalidar las cookies
    await clearTokens();
    clearAuth();
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