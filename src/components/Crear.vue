<template>
  <div class="modal-overlay" @click.self="closeModal">
    <section>
      <header>
        <h2>{{ postToEdit ? 'Editar post' : 'Subir un nuevo post' }}</h2>
        <button class="close-button" @click="closeModal">×</button>
      </header>
      <main class="form-container">
        <!-- Vista previa de la imagen -->
        <div class="image-preview" v-if="post.image">
          <img :src="imagePreviewUrl" alt="Vista previa de la imagen" />
        </div>

        <!-- Formulario -->
        <form @submit.prevent="handleSubmit" id="form">
          <!-- Paso 1: Seleccionar imagen -->
          <div v-if="currentStep === 1" class="step">
            <h3>Paso 1: Selecciona una imagen</h3>
            <div class="file-upload">
              <label for="file-input" class="upload-button">
                Seleccionar archivo
                <input id="file-input" type="file" @change="handleFileChange" style="display: none;"
                  class="wide-input" />
              </label>
              <p v-if="selectedFileName" class="file-name">{{ selectedFileName }}</p>
              <span v-if="errors.image" class="error">{{ errors.image }}</span>
            </div>
          </div>

          <!-- Paso 2: Título y descripción -->
          <div v-if="currentStep === 2" class="step">
            <h3>Paso 2: Título y descripción</h3>
            <label>
              Título
              <input type="text" v-model="post.title" placeholder="Título del post" @blur="validateTitle" />
              <span v-if="errors.title" class="error">{{ errors.title }}</span>
            </label>
            <label>
              Descripción
              <textarea v-model="post.description" placeholder="Descripción del post" @blur="validateDescription"
                :maxlength="maxDescriptionLength">
              </textarea>
              <span v-if="errors.content" class="error">{{ errors.content }}</span>
              <span class="counter">{{ post.description.length }} / {{ maxDescriptionLength }} caracteres</span>
            </label>
          </div>

          <!-- Paso 3: Ingredientes -->
          <div v-if="currentStep === 3" class="step">
            <h3>Paso 3: Ingredientes</h3>
            <div class="ingredients-container">
              <h3>Ingredientes</h3>
              <div class="ingredients-list">
                <div v-for="(ingredient, index) in post.ingredients" :key="index" class="ingredient-input">
                  <div class="input-group">
                    <div class="input-with-error">
                      <input class="input-ingredient" type="text" v-model="ingredient.name"
                        placeholder="Nombre del ingrediente" @blur="validateIngredientName(index)" />
                      <span v-if="errors[`ingredient_name_${index}`]" class="error">{{
                        errors[`ingredient_name_${index}`] }}</span>
                    </div>
                    <div class="input-with-error">
                      <input class="input-ingredient" type="text" v-model="ingredient.quantity"
                        placeholder="Ej: 500 gr (gr, kg, L, cdas)" @blur="validateIngredientQuantity(index)" />
                      <span v-if="errors[`ingredient_quantity_${index}`]" class="error">{{
                        errors[`ingredient_quantity_${index}`] }}</span>
                    </div>
                  </div>
                  <div class="accions-ingredients">
                    <button type="button" @click="addIngredient" class="add-button">+</button>
                    <button type="button" @click="removeIngredient(index)" class="remove-button"
                      :style="{ visibility: index > 0 ? 'visible' : 'hidden' }">
                      ×
                    </button>
                  </div>
                </div>
              </div>
              <span v-if="errors.ingredients" class="error">{{ errors.ingredients }}</span>
            </div>
          </div>

          <!-- Botones de navegación -->
          <div class="navigation-buttons">
            <button type="button" v-if="currentStep > 1" @click="prevStep" class="prev-button">Anterior</button>
            <button type="button" v-if="currentStep < 3" @click="nextStep" class="next-button">Siguiente</button>
          </div>
          <button type="submit" v-if="currentStep === 3" class="submit-button" :disabled="loading">
            {{ postToEdit ? 'Guardar cambios' : 'Subir post' }}
          </button>
        </form>
      </main>
    </section>
  </div>
</template>

<script>
import { useNotificationStore } from '../stores/notification';
import { apiService } from '../services/api'

export default {
  name: 'Crear',
  props: {
    postToEdit: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      notificationStore: useNotificationStore(),
      currentStep: 1, // Paso inicial
      post: {
        title: '',
        description: '',
        image: null,
        is_private: false,
        ingredients: [{ name: '', quantity: '' }]
      },
      imagePreviewUrl: '', // URL de la vista previa de la imagen
      loading: false,
      errors: {},
      message: '',
      selectedFileName: '',
      maxDescriptionLength: 300
    };
  },
  watch: {
    postToEdit: {
      immediate: true,
      handler(newPost) {
        if (newPost) {
          this.post.title = newPost.title || ''
          this.post.description = newPost.description || ''
          // En actualización, la imagen se reinicia; si el usuario no selecciona una nueva, el backend debe conservar la anterior.
          this.post.image = null
          this.post.is_private = newPost.is_private || false
          this.post.ingredients = this.parseIngredients(newPost.ingredients)
        }
      }
    },
    // Watchers para validaciones en tiempo real
    "post.title"(newVal) {
      this.validateTitle();
    },
    "post.description"(newVal) {
      this.validateDescription();
    },
    "post.ingredients": {
      deep: true, // Observa cambios en los objetos dentro del array
      handler() {
        this.validateIngredients();
      }
    }
  },
  methods: {
    handleFileUpload(event) {
      const file = event.target.files[0]
      if (file) this.post.image = file
    },

    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.selectedFileName = file.name;
        this.post.image = file;
        this.errors.image = ''; // Limpia el error si se selecciona un archivo

        // Crear una URL para la vista previa de la imagen
        this.imagePreviewUrl = URL.createObjectURL(file);
      } else {
        this.selectedFileName = '';
        this.post.image = null;
        this.imagePreviewUrl = ''; // Limpia la vista previa si no hay archivo
      }
    },

    addIngredient() {
      const lastIngredient = this.post.ingredients[this.post.ingredients.length - 1];

      // Validar que el último ingrediente tenga nombre y cantidad
      if (!lastIngredient.name || !lastIngredient.name.trim()) {
        this.errors[`ingredient_name_${this.post.ingredients.length - 1}`] = 'El nombre del ingrediente es requerido.';
        return;
      }

      if (!lastIngredient.quantity || !lastIngredient.quantity.trim()) {
        this.errors[`ingredient_quantity_${this.post.ingredients.length - 1}`] = 'La cantidad del ingrediente es requerida.';
        return;
      }

      // Si pasa la validación, limpiar errores y agregar un nuevo ingrediente
      this.errors[`ingredient_name_${this.post.ingredients.length - 1}`] = '';
      this.errors[`ingredient_quantity_${this.post.ingredients.length - 1}`] = '';
      this.post.ingredients.push({ name: '', quantity: '' });
    },

    removeIngredient(index) {
      if (this.post.ingredients.length > 1) {
        this.post.ingredients.splice(index, 1)
      }
    },

    parseIngredients(rawIngredients) {
      if (!rawIngredients) return [{ name: '', quantity: '' }]
      if (Array.isArray(rawIngredients)) return rawIngredients.length ? rawIngredients : [{ name: '', quantity: '' }]

      try {
        const parsed = JSON.parse(rawIngredients)
        return Array.isArray(parsed) && parsed.length ? parsed : [{ name: rawIngredients, quantity: '' }]
      } catch {
        try {
          const fixed = rawIngredients.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
          const parsed = JSON.parse(fixed)
          return Array.isArray(parsed) && parsed.length ? parsed : [{ name: rawIngredients, quantity: '' }]
        } catch {
          return [{ name: rawIngredients, quantity: '' }]
        }
      }
    },

    validateTitle() {
      if (!this.post.title || !this.post.title.trim()) {
        this.errors.title = 'El título es requerido.';
      } else if (this.post.title.trim().length < 3) {
        this.errors.title = 'El título debe tener al menos 3 caracteres.';
      } else {
        this.errors.title = '';
      }
    },

    validateDescription() {
      if (!this.post.description || !this.post.description.trim()) {
        this.errors.content = 'La descripción es requerida.';
      } else if (this.post.description.trim().length < 10) {
        this.errors.content = 'La descripción debe tener al menos 10 caracteres.';
      } else {
        this.errors.content = '';
      }
    },

    validateIngredients() {
      this.errors.ingredients = '';
      const quantityRegex = /^[0-9]+(?:\.[0-9]+)?\s*(gr|kg|L|cdas)$/i;

      this.post.ingredients.forEach((ingredient, index) => {
        if (!ingredient.name || !ingredient.name.trim()) {
          this.errors[`ingredient_name_${index}`] = 'El nombre del ingrediente es requerido.';
        } else {
          this.errors[`ingredient_name_${index}`] = '';
        }

        if (!ingredient.quantity || !ingredient.quantity.trim()) {
          this.errors[`ingredient_quantity_${index}`] = 'La cantidad del ingrediente es requerida.';
        } else if (!quantityRegex.test(ingredient.quantity.trim())) {
          this.errors[`ingredient_quantity_${index}`] = 'La cantidad debe ser un número seguido de una unidad válida: gr, kg, L o cdas.';
        } else {
          this.errors[`ingredient_quantity_${index}`] = '';
        }
      });
    },

    validateIngredientName(index) {
      const ingredient = this.post.ingredients[index];
      if (!ingredient.name || !ingredient.name.trim()) {
        this.errors[`ingredient_name_${index}`] = 'El nombre del ingrediente es requerido.';
      } else {
        this.errors[`ingredient_name_${index}`] = '';
      }
    },

    validateIngredientQuantity(index) {
      const ingredient = this.post.ingredients[index];
      const quantityRegex = /^[0-9]+(?:\.[0-9]+)?\s*(gr|kg|L|cdas)$/i;

      if (!ingredient.quantity || !ingredient.quantity.trim()) {
        this.errors[`ingredient_quantity_${index}`] = 'La cantidad del ingrediente es requerida.';
      } else if (!quantityRegex.test(ingredient.quantity.trim())) {
        this.errors[`ingredient_quantity_${index}`] = 'La cantidad debe ser un número seguido de una unidad válida: gr, kg, L o cdas.';
      } else {
        this.errors[`ingredient_quantity_${index}`] = '';
      }
    },

    // Además, puedes añadir validaciones en tiempo real para los ingredientes si lo deseas.
    validateForm() {
      this.validateTitle();
      this.validateDescription();
      this.post.ingredients.forEach((_, index) => {
        this.validateIngredientName(index);
        this.validateIngredientQuantity(index);
      });

      return !Object.values(this.errors).some(error => error);
    },

    async handleSubmit() {
      if (this.loading || !this.validateForm()) return

      // Validar tamaño de imagen (5 MB = 5 * 1024 * 1024 bytes)
      if (this.post.image && this.post.image.size > 5 * 1024 * 1024) {
        this.notificationStore.show('La imagen es demasiado grande. Por favor, comprímela o seleccione otra imagen.', 'error')
        return
      }

      this.loading = true
      this.message = this.postToEdit ? 'Actualizando post...' : 'Creando post...'

      const formData = new FormData()
      if (this.postToEdit) formData.append('_method', 'PUT')

      formData.append('title', this.post.title)
      formData.append('description', this.post.description)
      formData.append('is_private', this.post.is_private)
      formData.append('ingredients', JSON.stringify(this.post.ingredients))
      if (this.post.image) {
        formData.append('imagen', this.post.image)
      }

      try {
        const response = this.postToEdit
          ? await apiService.updatePost(this.postToEdit.id, formData)
          : await apiService.createPost(formData)

        if (response.data.status === 'success') {
          const msg = this.postToEdit ? 'Post actualizado correctamente' : 'Post creado correctamente'
          this.message = msg
          this.notificationStore.show(msg, 'success')
          this.$emit(this.postToEdit ? 'post-updated' : 'post-created', response.data.data)
          this.closeModal()
        }
      } catch (error) {
        // Si el servidor responde con un error 413 (Payload Too Large)
        if (error.response && error.response.status === 413) {
          this.notificationStore.show('La imagen es demasiado grande. Por favor, comprímela o seleccione otra imagen.', 'error')
        }
        // Si se recibe error 422 (Unprocessable Content) y se indica fallo en subir la imagen (posiblemente video)
        else if (error.response && error.response.status === 422 && error.response.data.message && error.response.data.message.imagen) {
          const imagenError = error.response.data.message.imagen[0] || ''
          if (imagenError.toLowerCase().includes('failed to upload')) {
            this.notificationStore.show('Los videos no están soportados aún. Por favor, seleccione una imagen.', 'error')
          } else {
            this.notificationStore.show(error.response.data.message || 'Error al procesar el post', 'error')
          }
        } else {
          this.notificationStore.show(error.response?.data?.message || 'Error al procesar el post', 'error')
        }
        console.error('Error:', error)
      } finally {
        this.loading = false
      }
    },

    closeModal() {
      this.$emit('close')
    },

    updateDescriptionCount() {
      // Aquí puedes incluir lógica adicional si fuera necesario
      // El contador se actualiza automáticamente gracias al v-model y a post.description.length
    },

    nextStep() {
      if (this.currentStep === 1 && !this.post.image) {
        this.errors.image = 'Debes seleccionar una imagen.';
        return;
      }
      if (this.currentStep === 2 && (!this.post.title || !this.post.description)) {
        this.validateTitle();
        this.validateDescription();
        return;
      }
      this.currentStep++;
    },

    prevStep() {
      this.currentStep--;
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
  width: 90%;
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
  flex-direction: row;
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
  width: 80%;
  margin: 0 auto;
  align-items: stretch;
  justify-content: center;
  align-content: center;
  flex-wrap: wrap;
}

label {
  width: 100%;
  text-align: left;
  display: flex;
  flex-direction: column;
}

.image-preview {
  width: 30%;
  height: auto;
}


img {
  max-width: 100%;
  max-height: 300px;
  margin: 20px auto;
  border-radius: 10px;
}

input,
textarea {
  width: 100%;
  padding: 15px;
  border: 1px solid var(--sombra-color);
  border-radius: 6px;
  color: black;
  font-size: 16px;
  background-color: white;
}



textarea {
  min-height: 60px;
  resize: none;
}



.error {
  display: block;
  color: var(--contrast-color);
  font-size: 14px;
  margin-top: 5px;
}

.input-with-error {
  display: flex;
  flex-direction: row;
  flex: 1;
  margin-right: 10px;
  align-content: center;
  align-items: center;
  gap: 1em;
}

.input-ingredient {
  width: fit-content;
}




.title-image-container {
  display: flex;
  justify-content: center;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: center;
  align-items: center;
}

.wide-input {
  width: 50%;
  text-align: left;
  display: flex;
  flex-direction: column;
  background: none;
}

.small-textarea {
  min-height: 80px;
  /* Ajusta la altura según sea necesario */
}

.ingredients-container {
  margin-top: 20px;
}

.ingredients-list {
  /* Ajusta la altura según el tamaño real de cada input (en este ejemplo se calcula 3 filas de 60px) */
  max-height: 170px;
  overflow-y: auto;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: stretch;
  justify-content: space-evenly;
  align-items: baseline;
  gap: 1em;
  margin-top: 1em;
}

.ingredient-input {
  display: flex;
  align-items: baseline;
  margin-bottom: 5px;
  align-content: center;
  justify-content: center;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1em;
}

.input-group {
  display: flex;
  flex: 1;
  flex-direction: column;
  flex-wrap: wrap;
  align-content: center;
  justify-content: center;
  align-items: stretch;
  gap: 1em;
}



.accions-ingredients {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  align-content: center;
  gap: 1em;
}

.add-button,
.remove-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 20px;
  height: 20px;
  font-size: 20px;
  text-align: center;
  margin-right: 1em;
}

.remove-button {
  background-color: var(--contrast-color);
}

.submit-button {
  width: 100%;
  max-width: 300px;
  padding: 15px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  background: var(--contrast-color);
  color: var(--text-color);
  transition: background-color 0.2s;
  margin: 0 auto;
}


.submit-button:hover {
  opacity: 0.9;
}

.counter {
  font-size: 0.85em;
  color: var(--text-color);
  text-align: right;
  margin-top: 4px;
  display: block;
}

.file-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
}

.upload-button {
  background-color: var(--primary-color);
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  text-align: center;
}

.upload-button:hover {
  background-color: var(--primary-color-dark);
}

.file-name {
  margin-top: 10px;
  font-size: 14px;
  color: var(--text-color);
  text-align: center;
  word-wrap: break-word;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.prev-button,
.next-button {
  background-color: var(--primary-color);
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  text-align: center;
}

.prev-button:hover,
.next-button:hover {
  background-color: var(--primary-color-dark);
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.prev-button,
.next-button {
  background-color: var(--primary-color);
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.prev-button:hover,
.next-button:hover,
.submit-button:hover {
  background-color: var(--primary-color-dark);
}
@media (max-width: 768px) {
  section {
    width: 90%;
    margin: 20px;
  }

  section main {
    flex-direction: column;
    align-items: center;
  }

  form {
    width: 90%;
  }

}

@media (max-width: 600px) {

  .input-ingredient{
    width: 100%;
  }
  .ingredient-input{
    gap: 0;
  }
}

@media (max-width: 480px) {
  section main {
    padding: 30px;
  }

  input,
  textarea,
  button[type="submit"] {
    padding: 12px;
  }
  button[type="submit"]{
    margin: 1em;
  }
  .input-with-error{
    flex-direction: column;
    gap: 0;
  }
}
</style>