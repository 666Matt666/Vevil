import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { login as apiLogin, getProfile, clearTokens, setAccessToken, setRefreshToken } from '@/services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);

  const isAuthenticated = computed(() => !!user.value);

  function clearAuth() {
    console.log('[AUTH] Clearing auth, user:', user.value);
    user.value = null;
  }

  async function fetchProfile() {
    console.log('[AUTH] fetchProfile: Starting...');
    try {
      const userData = await getProfile();
      console.log('[AUTH] fetchProfile: Success, user:', userData);
      user.value = userData as User;
      return true;
    } catch (error: any) {
      console.error('[AUTH] fetchProfile: Failed', error?.message);
      user.value = null;
      return false;
    }
  }

  async function login(email: string, password: string) {
    console.log('[AUTH] login: Starting for email:', email);
    // Usar api.ts login que maneja tokens correctamente
    const response = await apiLogin(email, password);
    console.log('[AUTH] login: API call successful, response:', response);

    // apiLogin ya guardó los tokens en localStorage via setAccessToken/setRefreshToken
    // Ahora obtenemos el perfil
    const success = await fetchProfile();
    if (!success) {
      console.error('[AUTH] login: fetchProfile failed');
      throw new Error('Login failed');
    }
    console.log('[AUTH] login: Complete, user:', user.value);
  }

  async function logout() {
    console.log('[AUTH] logout: Starting...');
    await clearTokens();
    clearAuth();
    console.log('[AUTH] logout: Complete');
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
    fetchProfile,
  };
});