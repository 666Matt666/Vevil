import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import DashboardView from '../views/DashboardView.vue';
import { useAuthStore } from '@/stores/auth'; // La importación está bien aquí

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login', // Redirige la raíz a la página de login
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }, // Marcamos esta ruta como protegida
    },
    {
      path: '/posts',
      name: 'posts',
      component: () => import('../views/PostsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('../views/ProductsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/customers',
      name: 'customers',
      component: () => import('../views/CustomersView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/invoices',
      name: 'invoices',
      component: () => import('../views/InvoicesView.vue'),
      meta: { requiresAuth: true },
    },
  ],
});

let isAuthInitialized = false;

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Si la sesión no ha sido inicializada (primera carga/recarga de página)
  if (!isAuthInitialized) {
    // Intentamos obtener el perfil del usuario usando el token de localStorage
    await authStore.fetchProfile();
    isAuthInitialized = true;
  }

  const isAuthenticated = authStore.isAuthenticated;

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Si la ruta es protegida y no estamos autenticados, vamos al login
    next({ name: 'login', query: { redirect: to.fullPath } });
  } else if ((to.name === 'login' || to.name === 'register') && isAuthenticated) {
    // Si ya estamos logueados, no nos dejes ir a login/register, vamos al dashboard
    next({ name: 'dashboard' });
  } else {
    // En cualquier otro caso, permite la navegación
    next();
  }
});

export default router;
