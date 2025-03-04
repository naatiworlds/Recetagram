<template>
  <div class="modal-overlay" @click.self="closeModal">
    <section>
      <header>
        <h2>Subir un nuevo post</h2>
        <button class="close-button" @click="closeModal">×</button>
      </header>
      <main>
        <div class="separador">
          <div class="linea"></div>
          <div class="circulo">📝</div>
          <div class="linea"></div>
        </div>
        
        <form @submit.prevent="submitPost" id="form">
          <label>
            Autor
            <input type="text" v-model="post.author" placeholder="Nombre del autor" required>
            <span v-if="errors.author" class="error">{{ errors.author }}</span>
          </label>
          
          <label>
            Título
            <input type="text" v-model="post.title" placeholder="Título del post" required>
            <span v-if="errors.title" class="error">{{ errors.title }}</span>
          </label>
          
          <label>
            Contenido
            <textarea v-model="post.content" placeholder="Contenido del post" required></textarea>
            <span v-if="errors.content" class="error">{{ errors.content }}</span>
          </label>
          
          <label>
            Etiquetas
            <input type="text" v-model="post.tags" placeholder="Buscar etiquetas" required>
            <span v-if="errors.tags" class="error">{{ errors.tags }}</span>
          </label>
          
          <label>
            Imagen
            <input type="file" @change="handleImageUpload" accept="image/png, image/jpeg" required>
            <span v-if="errors.image" class="error">{{ errors.image }}</span>
          </label>
          
          <button type="submit">Subir Post</button>
        </form>
      </main>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Crear',
  data() {
    return {
      post: {
        author: '',
        title: '',
        content: '',
        image: null,
        tags: ''
      },
      errors: {
        author: '',
        title: '',
        content: '',
        image: '',
        tags: ''
      }
    };
  },
  methods: {
    handleImageUpload(event) {
      const file = event.target.files[0];
      const validTypes = ['image/png', 'image/jpeg'];
      const maxSize = 2 * 1024 * 1024; // 2MB

      this.errors.image = '';

      if (!validTypes.includes(file.type)) {
        this.errors.image = 'Solo se permiten archivos PNG o JPG.';
        return;
      }

      if (file.size > maxSize) {
        this.errors.image = 'El tamaño del archivo no debe exceder los 2MB.';
        return;
      }

      const img = new Image();
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        if (width !== height) {
          this.errors.image = 'La imagen debe tener una proporción de 4:4 (cuadrada).';
          return;
        }
        this.post.image = URL.createObjectURL(file);
      };
      img.src = URL.createObjectURL(file);
    },
    submitPost() {
      this.clearErrors();

      if (!this.post.author) {
        this.errors.author = 'El autor es obligatorio.';
      }
      if (!this.post.title) {
        this.errors.title = 'El título es obligatorio.';
      }
      if (!this.post.content) {
        this.errors.content = 'El contenido es obligatorio.';
      }
      if (!this.post.tags) {
        this.errors.tags = 'Las etiquetas son obligatorias.';
      }
      if (!this.post.image) {
        this.errors.image = 'La imagen es obligatoria.';
      }

      if (Object.values(this.errors).some(error => error)) {
        return;
      }

      // Aquí puedes manejar la lógica para subir el post, por ejemplo, enviarlo a un servidor
      console.log(this.post);
      alert('Post subido con éxito');
      this.closeModal();
    },
    clearErrors() {
      this.errors = {
        author: '',
        title: '',
        content: '',
        image: '',
        tags: ''
      };
    },
    closeModal() {
      this.$emit('close');
    }
  }
}
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
</style>