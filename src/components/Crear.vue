<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      
      <section>
        <header>
          <details id="theme">
            <summary><i class="fa-solid fa-palette"></i> theme</summary>
            <label id="switch-black" style="display: block;">
              Dark
              <input type="radio" name="tema" value="dark">
            </label>
            <label id="switch-light" style="display: block;">
              Light
              <input type="radio" name="tema" value="light">
            </label>
            <label id="switch-default" style="display: block;">
              Default
              <input type="radio" name="tema" value="default" checked>
            </label>
          </details>
          <h2>Subir un nuevo post</h2>
          <button class="close-button" @click="closeModal">×</button>
        </header>
        <main class="crear-main">
          <form @submit.prevent="submitPost" id="form">
            <label for="author">
              Autor
              <input type="text" id="author" v-model="post.author" placeholder="Nombre del autor" required>
              <span v-if="errors.author" class="error">{{ errors.author }}</span>
            </label>
            <label for="title">
              Título
              <input type="text" id="title" v-model="post.title" placeholder="Título del post" required>
              <span v-if="errors.title" class="error">{{ errors.title }}</span>
            </label>
            <label for="content">
              Contenido
              <textarea id="content" v-model="post.content" placeholder="Contenido del post" required></textarea>
              <span v-if="errors.content" class="error">{{ errors.content }}</span>
            </label>
            <label for="tags">
              Etiquetas
              <input type="text" id="tags" v-model="post.tags" placeholder="Buscar etiquetas" required>
              <span v-if="errors.tags" class="error">{{ errors.tags }}</span>
            </label>
            <label for="image">
              Imagen
              <input type="file" id="image" @change="handleImageUpload" accept="image/png, image/jpeg" required>
              <span v-if="errors.image" class="error">{{ errors.image }}</span>
            </label>
            <button type="submit">Subir Post</button>
          </form>
        </main>
      </section>
    </div>
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

.modal-content {
  position: relative;
  border-radius: 10px;
  max-width: 35%; /* Aumenta el ancho máximo */
  width: 90%; /* Usa un porcentaje para adaptarlo a la pantalla */
  background: var(--secundary-color);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.close-button {
  background: none;
  border: none;
  font-size: 40px;
  cursor: pointer;
  color: var(--text-color-important);
  align-self: center; /* Centra el botón horizontalmente */
  margin-bottom: 10px;
}
header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  align-content: center;
  width: 100%;
  margin: 0 auto;
  background-color: var(--primary-color);
}

header h2 {
  color: var(--text-color-important);
}

section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  align-content: center;
  text-align: center;
  margin: 0 auto;
  gap: 5px;
  background-color: var(--secundary-color);
  border-radius: 10px;
  width: 100%;
}

section header {
  background-color: var(--primary-color);
  border-radius: 5px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  color: var(--text-color);
}

section header h2 {
  padding: 5px;
  color: var(--text-color-important);
}

section main {
  width: 90%;
  font-size: 24px;
}

section main form {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: .5em;
}

section main form label {
  display: flex;
  flex-direction: column;
  width: 100%;
  text-align: left;
  color: var(--text-color);
}

section main form input,
section main form textarea {
  border: 2px solid var(--sombra-color);
  padding: 5px;
  width: 100%;
}

section main form button {
  color: var(--text-color);
  background: var(--contrast-color);
  border: none;
  padding: 10px 40px;
  border-radius: 10px;
  font-size: 22px;
}

.error {
  color: red;
  font-size: 14px;
  margin-top: 5px;
}

footer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

footer p {
  font-weight: bold;
  text-align: center;
  color: var(--text-color-important);
}

footer .mobile-apps {
  text-align: center;
}

footer .mobile-apps button {
  width: 120px;
  background-color: var(--primary-color);
  border: none;
  color: var(--text-color);
  padding: 10px;
  border-radius: 10px;
  margin: 10px 0;
}

footer .mobile-apps button i {
  margin: 0 5px;
}


</style>