<template>
  <div class="modal-overlay" @click.self="closeModal">
    <section>
      <header>
        <h2>Subir un nuevo post</h2>
        <button class="close-button" @click="closeModal">×</button>
      </header>
      <main>
        <form @submit.prevent="submitPost" id="form">
          <div class="title-image-container">
            <label>
              Título
              <input type="text" v-model="post.title" placeholder="Título del post" required />
              <span v-if="errors.title" class="error">{{ errors.title }}</span>
            </label>
            <label>
              Imagen
              <input type="file" @change="handleFileUpload" accept="image/png, image/jpeg" required class="wide-input" />
              <span v-if="errors.image" class="error">{{ errors.image }}</span>
            </label>
          </div>
          
          <label>
            Descripción
            <textarea v-model="post.description" placeholder="Descripción del post" required class="small-textarea"></textarea>
            <span v-if="errors.description" class="error">{{ errors.description }}</span>
          </label>
          
          <div class="ingredients-container">
            <h3>Ingredientes</h3>
            <div v-for="(ingredient, index) in post.ingredients" :key="index" class="ingredient-input">
              <input type="text" v-model="ingredient.name" placeholder="Nombre del ingrediente" required />
              <input type="text" v-model="ingredient.quantity" placeholder="Cantidad" required />
              <button type="button" @click="removeIngredient(index)" class="remove-button">×</button>
              <button type="button" @click="addIngredient" class="add-button">+</button>
            </div>
          </div>

          <button type="submit">Subir Post</button>
        </form>
        <div v-if="message">{{ message }}</div>
      </main>
    </section>
  </div>
</template>

<script>
import { useAuthStore } from '../stores/auth';
import { API_BASE_URL } from '../utils/globalConstants';
import axios from 'axios';

export default {
  name: 'Crear',
  data() {
    return {
      post: {
        title: '',
        description: '',
        imagen: null,
        ingredients: [{ name: '', quantity: '' }] // Inicializa con un ingrediente vacío
      },
      errors: {
        title: '',
        description: '',
        image: '',
      },
      message: ''
    };
  },
  methods: {
    handleFileUpload(event) {
      const file = event.target.files[0]; // Captura el archivo de imagen
      console.log('Archivo de imagen capturado:', file); // Trazabilidad
      this.post.imagen = file; // Asigna el archivo a la propiedad 'imagen'
    },
    addIngredient() {
      this.post.ingredients.push({ name: '', quantity: '' }); // Añade un nuevo ingrediente vacío
    },
    removeIngredient(index) {
      this.post.ingredients.splice(index, 1); // Elimina el ingrediente en el índice especificado
    },
    async submitPost() {
      const formData = new FormData();
      const authStore = useAuthStore();
      this.post.author = authStore.user?.name || 'Autor desconocido';

      // Validaciones
      if (!this.post.title) {
        this.errors.title = 'El título es obligatorio.';
      }
      if (!this.post.description) {
        this.errors.description = 'La descripción es obligatoria.';
      }
      if (!this.post.imagen) {
        this.errors.image = 'La imagen es obligatoria.';
      }
      if (this.post.ingredients.some(ingredient => !ingredient.name || !ingredient.quantity)) {
        this.errors.ingredients = 'Todos los ingredientes deben tener nombre y cantidad.';
      }

      if (Object.values(this.errors).some(error => error)) {
        console.log('Errores encontrados:', this.errors);
        return;
      }

      // Preparar los datos para enviar
      formData.append('author', this.post.author);
      formData.append('title', this.post.title);
      formData.append('description', this.post.description);
      formData.append('imagen', this.post.imagen);
      formData.append('ingredients', JSON.stringify(this.post.ingredients)); // Asegúrate de que este campo esté presente

      console.log('Datos a enviar:', {
        author: this.post.author,
        title: this.post.title,
        description: this.post.description,
        imagen: this.post.imagen,
        ingredients: this.post.ingredients
      }); // Trazabilidad de los datos enviados

      try {
        const response = await axios.post(`${API_BASE_URL}/posts`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        this.message = response.data.message;

        // Cerrar el modal y emitir evento de nuevo post
        this.closeModal(true);
        this.$emit('reloadPosts'); // Emitir evento para recargar los posts
      } catch (error) {
        console.error('Error al subir el post:', error);
        console.error('Detalles de la respuesta del servidor:', error.response.data);
        this.message = 'Error al subir el post: ' + (error.response?.data?.message || error.message);
      }
    },
    closeModal(created = false) {
      this.$emit('close', created); // Emitir evento con información si se creó un nuevo post
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

section {
  grid-area: var(--main-area);
  background-color: var(--secundary-color);
  border-radius: 10px;
  width: 600px;
  height: auto;
  min-height: 600px;
  margin: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

section header {
  background-color: var(--primary-color);
  border-radius: 10px 10px 0 0;
  padding: 20px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

section header h2 {
  font-size: 24px;
  color: var(--text-color-important);
}

.close-button {
  position: absolute;
  right: 20px;
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-color-important);
  cursor: pointer;
}

section main {
  padding: 50px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.separador {
  display: flex;
  flex-direction: row;
  margin-bottom: 30px;
  align-items: center;
}

.separador .linea {
  flex: 1;
  height: 1px;
  background-color: var(--text-color-important);
  opacity: 0.3;
}

.separador .circulo {
  padding: 0 20px;
  font-size: 24px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 30px;
  width: 80%;
  margin: 0 auto;
}

label {
  width: 100%;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

input, textarea {
  width: 100%;
  padding: 15px;
  border: 1px solid var(--sombra-color);
  border-radius: 6px;
  font-size: 16px;
  background-color: white;
}

textarea {
  min-height: 120px;
  resize: vertical;
}

button[type="submit"] {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  background: var(--contrast-color);
  color: var(--text-color);
  transition: background-color 0.2s;
}

button[type="submit"]:hover {
  opacity: 0.9;
}

.error {
  color: var(--contrast-color);
  font-size: 14px;
  margin-top: 5px;
}

@media (max-width: 768px) {
  section {
    width: 90%;
    margin: 20px;
  }
  
  form {
    width: 90%;
  }
}

@media (max-width: 480px) {
  section main {
    padding: 30px;
  }
  
  input, textarea, button[type="submit"] {
    padding: 12px;
  }
}

.title-image-container {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.wide-input {
  width: 100%; /* Aumenta el ancho del input de imagen */
}

.small-textarea {
  min-height: 80px; /* Ajusta la altura según sea necesario */
}

.ingredients-container {
  margin-top: 20px;
}

.ingredient-input {
  display: flex;
  align-items: center;
  margin-bottom: 5px; /* Reduce el espacio vertical */
}

.ingredient-input input {
  flex: 1;
  margin-right: 10px;
}

.remove-button, .add-button {
  background-color: red; /* Fondo rojo para los botones */
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  padding: 5px 10px;
  width: 40px; /* Establece un ancho fijo para ambos botones */
  height: 40px; /* Establece una altura fija para ambos botones */
  font-size: 20px; /* Asegura que el tamaño de la fuente sea consistente */
}

.add-button {
  margin-left: 10px; /* Espacio entre la "X" y el botón "+" */
}
</style>