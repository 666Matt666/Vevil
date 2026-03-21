<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/services/api';

import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Card from 'primevue/card';
import Message from 'primevue/message';

const router = useRouter();
const authStore = useAuthStore();

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const error = ref('');
const success = ref('');
const isLoading = ref(false);

const handleChangePassword = async () => {
  error.value = '';
  success.value = '';
  
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Las contraseñas no coinciden';
    return;
  }
  
  if (newPassword.value.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres';
    return;
  }
  
  isLoading.value = true;
  try {
    await api.post('/auth/change-password', {
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
    });
    success.value = 'Contraseña actualizada correctamente';
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || 'Error al cambiar la contraseña';
    if (errorMessage.includes('incorrecta')) {
      error.value = 'La contraseña actual es incorrecta';
    } else {
      error.value = errorMessage;
    }
  } finally {
    isLoading.value = false;
  }
};

const goToDashboard = () => {
  router.push({ name: 'dashboard' });
};

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'login' });
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
        <h2 class="text-center text-2xl font-bold">Cambiar Contraseña</h2>
      </template>
      <template #content>
        <form @submit.prevent="handleChangePassword" class="flex flex-column gap-4">
          <div class="p-float-label">
            <InputText id="currentPassword" v-model="currentPassword" type="password" class="w-full" required />
            <label for="currentPassword">Contraseña Actual</label>
          </div>
          <div class="p-float-label">
            <InputText id="newPassword" v-model="newPassword" type="password" class="w-full" required />
            <label for="newPassword">Nueva Contraseña</label>
          </div>
          <div class="p-float-label">
            <InputText id="confirmPassword" v-model="confirmPassword" type="password" class="w-full" required />
            <label for="confirmPassword">Confirmar Nueva Contraseña</label>
          </div>
          <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
          <Message v-if="success" severity="success" :closable="false">{{ success }}</Message>
          <Button type="submit" label="Cambiar Contraseña" class="w-full" :loading="isLoading" />
          <Button type="button" label="Volver al Dashboard" class="w-full p-button-secondary" @click="goToDashboard" />
        </form>
      </template>
    </Card>
  </div>
</template>
