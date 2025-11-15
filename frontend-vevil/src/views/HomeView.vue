<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';

// Creamos variables reactivas para almacenar los datos del formulario
const name = ref('');
const email = ref('');
const password = ref('');
const message = ref(''); // Para mostrar mensajes de éxito o error

// Función que se ejecuta al enviar el formulario
const handleRegister = async () => {
  message.value = 'Registrando...';
  try {
    // Hacemos la petición POST al endpoint de registro del backend.
    // Gracias al proxy de Vite, '/api' se redirige a 'http://localhost:3000'.
    const response = await axios.post('/api/auth/register', {
      name: name.value,
      email: email.value,
      password: password.value,
    });

    // Si todo va bien, mostramos un mensaje de éxito.
    message.value = `¡Usuario registrado con éxito! ID: ${response.data.id}`;
    
    // Limpiamos el formulario
    name.value = '';
    email.value = '';
    password.value = '';

  } catch (error: any) {
    // Si hay un error, mostramos el mensaje que nos devuelve el backend.
    if (error.response && error.response.data) {
      message.value = `Error: ${error.response.data.message}`;
    } else {
      message.value = 'Error al conectar con el servidor.';
    }
    console.error('Error en el registro:', error);
  }
};
</script>

<template>
  <main>
    <div class="register-form">
      <h1>Registro de Usuario</h1>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="name">Nombre:</label>
          <input type="text" id="name" v-model="name" required />
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="email" required />
        </div>
        <div class="form-group">
          <label for="password">Contraseña:</label>
          <input type="password" id="password" v-model="password" required minlength="8" />
        </div>
        <button type="submit">Registrar</button>
      </form>
      <p v-if="message" class="message">{{ message }}</p>
    </div>
  </main>
</template>

<style scoped>
main {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}
.register-form {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
h1 {
  text-align: center;
  margin-bottom: 1.5rem;
}
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}
.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  width: 100%;
  padding: 0.75rem;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}
button:hover {
  background-color: #33a06f;
}
.message {
  margin-top: 1rem;
  text-align: center;
  color: #333;
}
</style>
