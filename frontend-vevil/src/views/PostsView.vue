<template>
  <div class="posts-view">
    <h1>Mis Publicaciones</h1>

    <!-- Formulario para crear una nueva publicación -->
    <div class="post-form">
      <h2>Crear nueva publicación</h2>
      <form @submit.prevent="handleCreatePost">
        <input v-model="newPost.title" type="text" placeholder="Título" required />
        <textarea v-model="newPost.content" placeholder="Contenido..." required></textarea>
        <button type="submit" :disabled="postsStore.isLoading">
          {{ postsStore.isLoading ? 'Creando...' : 'Crear Publicación' }}
        </button>
      </form>
      <p v-if="postsStore.error" class="error">{{ postsStore.error }}</p>
    </div>

    <!-- Lista de publicaciones -->
    <div class="posts-list">
      <h2>Publicaciones existentes</h2>
      <div v-if="postsStore.isLoading && postsStore.posts.length === 0">Cargando...</div>
      <div v-else-if="postsStore.posts.length === 0">No tienes publicaciones todavía.</div>
      <ul v-else>
        <li v-for="post in postsStore.posts" :key="post.id">
          <h3>{{ post.title }}</h3>
          <p>{{ post.content }}</p>
          <!-- Aquí irían los botones de Editar y Eliminar -->
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { usePostsStore } from '@/stores/posts';

const postsStore = usePostsStore();

const newPost = reactive({
  title: '',
  content: '',
});

const handleCreatePost = async () => {
  if (!newPost.title || !newPost.content) return;
  await postsStore.createPost({ ...newPost });
  // Limpiar el formulario si la creación fue exitosa
  if (!postsStore.error) {
    newPost.title = '';
    newPost.content = '';
  }
};

// Cargar las publicaciones cuando el componente se monta
onMounted(() => {
  postsStore.fetchPosts();
});
</script>

<style scoped>
.posts-view {
  max-width: 800px;
  margin: 0 auto;
}
.post-form, .posts-list {
  margin-top: 2rem;
}
/* Añade más estilos según necesites */
</style>