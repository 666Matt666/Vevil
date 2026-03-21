<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

// Importamos los componentes de PrimeVue que vamos a usar
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Card from 'primevue/card';
import Message from 'primevue/message';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const error = ref('');
const isLoading = ref(false);

const showRegisterOption = ref(false);

const handleLogin = async () => {
  error.value = '';
  showRegisterOption.value = false;
  isLoading.value = true;
  try {
    await authStore.login(email.value, password.value);
    router.push({ name: 'dashboard' });
  } catch (err: any) {
    const errorMessage = err.message || err.response?.data?.message || 'Error al iniciar sesión';
    
    if (errorMessage === 'USER_NOT_FOUND' || errorMessage.includes('USER_NOT_FOUND')) {
      error.value = 'El email ingresado no existe en nuestro sistema.';
      showRegisterOption.value = true;
    } else if (errorMessage === 'INVALID_PASSWORD' || errorMessage.includes('INVALID_PASSWORD')) {
      error.value = 'La contraseña es incorrecta. Por favor, intenta nuevamente.';
    } else {
      error.value = 'Error al iniciar sesión. Por favor, verifica tus credenciales.';
    }
  } finally {
    isLoading.value = false;
  }
};

// Si el usuario ya está logueado, redirigir al dashboard
onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push({ name: 'dashboard' });
  }
});
</script>

<template>
  <div class="flex align-items-center justify-content-center min-h-screen surface-ground p-4">
    <Card class="w-full max-w-25rem shadow-2">
      <template #header>
        <div class="flex justify-content-center p-6">
          <img src="@/assets/vevil-logo.svg" alt="Vevil Logo" class="h-20" />
        </div>
      </template>
      <template #title>
        <h2 class="text-center text-2xl font-bold">Bienvenido</h2>
      </template>
      <template #content>
        <form @submit.prevent="handleLogin" class="flex flex-column gap-4">
          <div class="p-float-label">
            <InputText id="email" v-model="email" type="email" class="w-full" required />
            <label for="email">Email</label>
          </div>
          <div class="p-float-label">
            <InputText id="password" v-model="password" type="password" class="w-full" required />
            <label for="password">Contraseña</label>
          </div>
          <Message v-if="error && !showRegisterOption" severity="error" :closable="false">{{ error }}</Message>
          <Message v-if="showRegisterOption" severity="warn" :closable="false">
            <span>{{ error }}</span>
            <br />
            <router-link to="/register" class="font-medium text-primary-500 hover:text-primary-400">¿No tienes una cuenta? Regístrate aquí</router-link>
          </Message>
          <Button type="submit" label="Iniciar Sesión" class="w-full" :loading="isLoading" />
        </form>
      </template>
      <template #footer>
        <p class="mt-4 text-center text-sm">
          ¿No tienes una cuenta?
          <router-link to="/register" class="font-medium text-primary-500 hover:text-primary-400">Regístrate aquí</router-link>
        </p>
      </template>
    </Card>
  </div>
</template>