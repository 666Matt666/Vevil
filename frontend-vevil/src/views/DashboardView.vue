<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Card from 'primevue/card';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push({ name: 'login' });
};

const menuItems = [
    { label: 'Productos', icon: 'pi pi-box', route: 'products', color: 'bg-blue-500', description: 'Gestionar stock de combustible y productos' },
    { label: 'Clientes', icon: 'pi pi-users', route: 'customers', color: 'bg-green-500', description: 'Gestionar base de datos de clientes' },
    { label: 'Facturas', icon: 'pi pi-file', route: 'invoices', color: 'bg-orange-500', description: 'Crear y ver facturas' },
];
</script>

<template>
  <div class="p-4">
    <div class="mb-5">
        <h1 class="text-3xl font-bold text-gray-800">¡Bienvenido, {{ authStore.user?.name || 'Usuario' }}!</h1>
        <p class="text-gray-600">¿Qué te gustaría hacer hoy?</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="item in menuItems" :key="item.label" class="col-12 md:col-4">
            <Card class="cursor-pointer hover:shadow-lg transition-shadow duration-300 h-full" @click="router.push({ name: item.route })">
                <template #header>
                    <div :class="`h-32 ${item.color} flex align-items-center justify-content-center text-white`">
                        <i :class="`${item.icon} text-6xl`"></i>
                    </div>
                </template>
                <template #title>
                    {{ item.label }}
                </template>
                <template #content>
                    <p class="m-0">
                        {{ item.description }}
                    </p>
                </template>
            </Card>
        </div>
    </div>

    <div class="mt-6 flex justify-content-end">
        <Button @click="handleLogout" label="Cerrar Sesión" icon="pi pi-power-off" severity="danger" text />
    </div>
  </div>
</template>