<template>
  <div class="modal-overlay" @click.self="closeModal">
    <section>
      <header>
        <h2>{{ postToEdit ? 'Editar post' : 'Subir un nuevo post' }}</h2>
        <button class="close-button" @click="closeModal">×</button>
      </header>
      <main>
        <form @submit.prevent="handleSubmit" id="form">
          <div class="title-image-container">
            <label>
              Título
              <input type="text" v-model="post.title" placeholder="Título del post" @input="validateTitle" />
              <span v-if="errors.title" class="error">{{ errors.title }}</span>
            </label>
            <label>
              Imagen
              <input type="file" @change="handleFileUpload" accept="image/png, image/jpeg" :required="!postToEdit"
                class="wide-input" />
              <span v-if="errors.image" class="error">{{ errors.image }}</span>
            </label>
          </div>

          <label>
            Descripción
            <textarea v-model="post.description" placeholder="Descripción del post"
              @input="updateDescriptionCount" :maxlength="maxDescriptionLength"></textarea>
            <span v-if="errors.content" class="error">{{ errors.content }}</span>
            <!-- Contador de caracteres -->
            <span class="counter">{{ post.description.length }} / {{ maxDescriptionLength }} caracteres</span>
          </label>

          <div class="ingredients-container">
            <h3>Ingredientes</h3>
            <div class="ingredients-list">
              <div v-for="(ingredient, index) in post.ingredients" :key="index" class="ingredient-input">
                <div class="input-with-error">
                  <input type="text" v-model="ingredient.name" placeholder="Nombre del ingrediente" />
                  <span v-if="errors[`ingredient_name_${index}`]" class="error">{{ errors[`ingredient_name_${index}`]
                    }}</span>
                </div>
                <div class="input-with-error">
                  <input type="text" v-model="ingredient.quantity" placeholder="Ej: 500 gr (gr, kg, L, cdas)" />
                  <span v-if="errors[`ingredient_quantity_${index}`]" class="error">{{
                    errors[`ingredient_quantity_${index}`] }}</span>
                </div>
                <button type="button" @click="removeIngredient(index)" class="remove-button">×</button>
                <button type="button" @click="addIngredient" class="add-button">+</button>
              </div>
            </div>
            <span v-if="errors.ingredients" class="error">{{ errors.ingredients }}</span>
          </div>

          <button type="submit" class="submit-button" :disabled="loading">
            {{ postToEdit ? 'Guardar cambios' : 'Subir post' }}
          </button>
        </form>
        <div v-if="message">{{ message }}</div>
      </main>
    </section>
  </div>
</template>

<script>
import { useNotificationStore } from '../stores/notification'
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
      post: {
        title: '',
        description: '',
        image: null,
        is_private: false,
        ingredients: [{ name: '', quantity: '' }]
      },
      loading: false,
      errors: {},
      message: '',
      notificationStore: useNotificationStore(),
      maxDescriptionLength: 300  // Máximo de caracteres permitidos
    }
  },
  watch: {
    postToEdit: {
      immediate: true,
      handler(newPost) {
        if (newPost) {
          this.post.title = newPost.title || ''
          this.post.description = newPost.description || ''
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
    }
  },
  methods: {
    handleFileUpload(event) {
      const file = event.target.files[0]
      if (file) this.post.image = file
    },

    addIngredient() {
      this.post.ingredients.push({ name: '', quantity: '' })
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
        this.errors.title = 'El título es requerido.'
      } else if (this.post.title.trim().length < 3) {
        this.errors.title = 'El título debe tener al menos 3 caracteres.'
      } else if (this.post.title.trim().length > 100) {
        this.errors.title = 'El título no puede exceder los 100 caracteres.'
      } else {
        this.errors.title = ''
      }
    },

    validateDescription() {
      if (!this.post.description || !this.post.description.trim()) {
        this.errors.content = 'La descripción es requerida.'
      } else if (this.post.description.trim().length < 10) {
        this.errors.content = 'La descripción debe tener al menos 10 caracteres.'
      } else {
        this.errors.content = ''
      }
    },

    // Además, puedes añadir validaciones en tiempo real para los ingredientes si lo deseas.
    validateForm() {
      this.errors = {}
      let isValid = true

      // Validar título (ya se valida en tiempo real)
      this.validateTitle();
      if (this.errors.title) isValid = false

      // Validar descripción
      this.validateDescription();
      if (this.errors.content) isValid = false

      // Validar imagen: requerida solo si no se está editando.
      if (!this.postToEdit && !this.post.image) {
        this.errors.image = 'La imagen es requerida.'
        isValid = false
      }

      // Validar ingredientes: debe haber al menos uno con nombre y cantidad válida.
      const validIngredients = this.post.ingredients.filter(
        ing => ing.name && ing.name.trim() && ing.quantity && ing.quantity.trim()
      )
      if (validIngredients.length === 0) {
        this.errors.ingredients = 'Al menos un ingrediente válido es requerido.'
        isValid = false
      } else {
        // Regex para validar cantidad: número (con o sin decimales) y unidad (gr, kg, L, cdas)
        const quantityRegex = /^[0-9]+(?:\.[0-9]+)?\s*(gr|kg|L|cdas)$/i
        this.post.ingredients.forEach((ing, index) => {
          if (!ing.name || !ing.name.trim()) {
            this.errors[`ingredient_name_${index}`] = 'El nombre del ingrediente es requerido.'
            isValid = false
          }
          if (!ing.quantity || !ing.quantity.trim()) {
            this.errors[`ingredient_quantity_${index}`] = 'La cantidad del ingrediente es requerida.'
            isValid = false
          } else if (!quantityRegex.test(ing.quantity.trim())) {
            this.errors[`ingredient_quantity_${index}`] = 'La cantidad debe ser un número seguido de una unidad válida: gr, kg, L o cdas.'
            isValid = false
          }
        })
      }

      return isValid
    },

    async handleSubmit() {
      if (this.loading || !this.validateForm()) return

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
        console.error('Error:', error)
        this.notificationStore.show(error.response?.data?.message || 'Error al procesar el post', 'error')
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
  display: block;
  color: var(--contrast-color);
  font-size: 14px;
  margin-top: 5px;
}
.input-with-error {
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-right: 10px;
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

  input,
  textarea,
  button[type="submit"] {
    padding: 12px;
  }
}

.title-image-container {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.wide-input {
  width: 100%;
  /* Aumenta el ancho del input de imagen */
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
  max-height: 180px;
  overflow-y: auto;
}

.ingredient-input {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  /* Reduce el espacio vertical */
}

.ingredient-input input {
  flex: 1;
  margin-right: 10px;
}

.remove-button,
.add-button {
  background-color: red;
  /* Fondo rojo para los botones */
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  padding: 5px 10px;
  width: 40px;
  /* Establece un ancho fijo para ambos botones */
  height: 40px;
  /* Establece una altura fija para ambos botones */
  font-size: 20px;
  /* Asegura que el tamaño de la fuente sea consistente */
}

.add-button {
  margin-left: 10px;
  /* Espacio entre la "X" y el botón "+" */
}

.submit-button {
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
</style>