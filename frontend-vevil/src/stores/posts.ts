import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/api/axios';

export interface Post {
  id: string;
  title: string;
  content: string;
  userId: string;
}

export const usePostsStore = defineStore('posts', () => {
  const posts = ref<Post[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchPosts() {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await apiClient.get<Post[]>('/posts');
      posts.value = response.data;
    } catch (e) {
      error.value = 'No se pudieron cargar las publicaciones.';
      console.error(e);
    } finally {
      isLoading.value = false;
    }
  }

  async function createPost(newPost: { title: string; content: string }) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await apiClient.post<Post>('/posts', newPost);
      posts.value.unshift(response.data); // Añadir el nuevo post al inicio de la lista
    } catch (e) {
      error.value = 'No se pudo crear la publicación.';
      console.error(e);
    } finally {
      isLoading.value = false;
    }
  }

  // Aquí irían las funciones para updatePost y deletePost

  return {
    posts,
    isLoading,
    error,
    fetchPosts,
    createPost,
  };
});