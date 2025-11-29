import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import apiClient from '@/api/axios';

export interface User {
  id: string;
  name: string;
  email: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  // Al iniciar, intentamos leer el token desde localStorage
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'));

  // Un getter computado que nos dice si el usuario está realmente autenticado
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value);

  function setToken(token: string) {
    accessToken.value = token;
    // Guardamos el token en localStorage para persistir la sesión
    localStorage.setItem('accessToken', token);
  }

  function clearAuth() {
    user.value = null;
    accessToken.value = null;
    localStorage.removeItem('accessToken');
  }

  async function fetchProfile() {
    // Si no hay token, no hay nada que hacer
    if (!accessToken.value) return;

    try {
      const response = await apiClient.get<User>('/auth/profile');
      user.value = response.data;
    } catch (error) {
      // Si el token es inválido o expiró, limpiamos todo
      console.error('Failed to fetch profile, token might be invalid.', error);
      clearAuth();
    }
  }

  async function login(email: string, password: string) {
    const response = await apiClient.post<{ access_token: string }>('/auth/login', { email, password });
    setToken(response.data.access_token);
    // Inmediatamente después de obtener el token, buscamos el perfil
    await fetchProfile();
  }

  function logout() {
    clearAuth();
  }

  return {
    user,
    accessToken,
    isAuthenticated,
    login,
    logout,
    fetchProfile, // Exponemos fetchProfile para usarlo al inicio de la app
  };
}
);