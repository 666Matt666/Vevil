<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/api/axios'; // Usar el cliente de API centralizado

// Importamos los componentes de PrimeVue
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Card from 'primevue/card';
import Message from 'primevue/message';

const router = useRouter();

const name = ref('');
const email = ref('');
const password = ref('');
const error = ref('');
const successMessage = ref('');
const isLoading = ref(false);

const handleRegister = async () => {
  error.value = '';
  successMessage.value = '';
  isLoading.value = true;
  try {
    await apiClient.post('/auth/register', { // Usar apiClient y la ruta sin /api
      name: name.value,
      email: email.value,
      password: password.value,
    });
    successMessage.value = '¡Registro exitoso! Ahora puedes iniciar sesión.';
    setTimeout(() => router.push({ name: 'login' }), 2000);
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error en el registro. Inténtalo de nuevo.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="flex align-items-center justify-content-center min-h-screen surface-ground p-4">
    <Card class="w-full max-w-25rem shadow-2">
      <template #title>
        <h2 class="text-center text-2xl font-bold">Crear una cuenta</h2>
      </template>
      <template #content>
        <form @submit.prevent="handleRegister" class="flex flex-column gap-4">
          <div class="p-float-label">
            <InputText id="name" v-model="name" type="text" class="w-full" required />
            <label for="name">Nombre</label>
          </div>
          <div class="p-float-label">
            <InputText id="email" v-model="email" type="email" class="w-full" required />
            <label for="email">Email</label>
          </div>
          <div class="p-float-label">
            <InputText id="password" v-model="password" type="password" class="w-full" required />
            <label for="password">Contraseña</label>
          </div>
          <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
          <Message v-if="successMessage" severity="success" :closable="false">{{ successMessage }}</Message>
          <Button type="submit" label="Registrarse" class="w-full" :loading="isLoading" />
        </form>
      </template>
      <template #footer>
        <p class="mt-4 text-center text-sm">
          ¿Ya tienes una cuenta?
          <router-link to="/login" class="font-medium text-primary-500 hover:text-primary-400">Inicia sesión</router-link>
        </p>
      </template>
    </Card>
  </div>
</template>