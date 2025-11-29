<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth';
import Menubar from 'primevue/menubar';
import Button from 'primevue/button';
import { computed, ref } from 'vue';

const authStore = useAuthStore();
const router = useRouter();

const isDark = ref(false);

const toggleDarkMode = () => {
    isDark.value = !isDark.value;
    const element = document.querySelector('html');
    if (isDark.value) {
        element?.classList.add('my-app-dark');
    } else {
        element?.classList.remove('my-app-dark');
    }
};

const items = computed(() => [
    {
        label: 'Panel',
        icon: 'pi pi-home',
        command: () => router.push({ name: 'dashboard' })
    },
    {
        label: 'Productos',
        icon: 'pi pi-box',
        command: () => router.push({ name: 'products' })
    },
    {
        label: 'Clientes',
        icon: 'pi pi-users',
        command: () => router.push({ name: 'customers' })
    },
    {
        label: 'Facturas',
        icon: 'pi pi-file',
        command: () => router.push({ name: 'invoices' })
    }
]);

const handleLogout = () => {
  authStore.logout();
  router.push({ name: 'login' });
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <Menubar v-if="authStore.isAuthenticated" :model="items" class="border-none shadow-sm mb-4 border-noround">
        <template #start>
            <img src="@/assets/vevil-logo.svg" alt="Vevil Logo" class="h-8 mr-2" />
            <span class="font-bold text-xl text-primary">Sistema Vevil</span>
        </template>
        <template #end>
            <div class="flex align-items-center gap-2">
                <Button :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'" text rounded aria-label="Cambiar modo oscuro" @click="toggleDarkMode" />
                <span class="text-sm font-medium mr-2">{{ authStore.user?.name }}</span>
                <Button icon="pi pi-power-off" severity="danger" text rounded aria-label="Cerrar sesión" @click="handleLogout" />
            </div>
        </template>
    </Menubar>

    <div class="container mx-auto px-4">
        <RouterView v-slot="{ Component }">
            <Transition name="fade" mode="out-in">
                <component :is="Component" />
            </Transition>
        </RouterView>
    </div>
  </div>
</template>

<style>
body {
    margin: 0;
    font-family: var(--font-family);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
