<template>
  <div class="modal-overlay" @click.self="closeModal">
    <section class="crear-post-container">
      <header>
        <h2>{{ postToEdit ? 'Editar post' : 'Subir un nuevo post' }}</h2>
        <button class="close-button" @click="closeModal">×</button>
      </header>

      <main class="form-container">
        <!-- Vista previa de la imagen -->
        <div class="image-preview" v-if="imagePreviewUrl">
          <img :src="imagePreviewUrl" alt="Vista previa de la imagen" />
        </div>

        <form @submit.prevent="handleSubmit" id="form">
          <!-- Paso 1: Seleccionar imagen -->
          <div v-if="currentStep === 1" class="step">
            <h3>Paso 1: Selecciona una imagen</h3>
            <div class="file-upload">
              <label for="file-input" class="upload-button">
                Seleccionar archivo
                <input id="file-input" type="file" @change="handleFileChange" accept="image/*" style="display: none;"
                  class="wide-input" />
              </label>
              <p v-if="selectedFileName" class="file-name">{{ selectedFileName }}</p>
              <span v-if="errors.image" class="error">
                <i class="fa fa-warning"></i> {{ errors.image }}
              </span>
            </div>
          </div>

          <!-- Paso 2: Título y descripción -->
          <div v-if="currentStep === 2" class="step">
            <h3>Paso 2: Título y descripción</h3>
            <label>
              Título
              <input type="text" v-model="post.title" placeholder="Título del post" @blur="validateTitle" />
              <span v-if="errors.title" class="error">
                <i class="fa fa-warning"></i> {{ errors.title }}
              </span>
            </label>

            <label>
              Descripción
              <textarea v-model="post.description" placeholder="Descripción del post" @blur="validateDescription"
                :maxlength="maxDescriptionLength" class="small-textarea"></textarea>
              <span v-if="errors.content" class="error">
                <i class="fa fa-warning"></i> {{ errors.content }}
              </span>
              <span class="counter">
                {{ post.description.length }} / {{ maxDescriptionLength }} caracteres
              </span>
            </label>
          </div>

          <!-- Paso 3: Ingredientes -->
          <div v-if="currentStep === 3" class="step">
            <h3>Paso 3: Ingredientes</h3>
            <div class="ingredients-container">

              <div class="ingredients-list">
                <IngredientInput v-for="(ing, index) in post.ingredients" :key="index" :ingredient="ing" :errors="{
                  name: errors[`ingredient_name_${index}`],
                  quantity: errors[`ingredient_quantity_${index}`],
                  unit: errors[`ingredient_unit_${index}`]
                }" :canDelete="post.ingredients.length > 1" @update:ingredient="val => updateIngredient(index, val)"
                  @validate-name="validateIngredientName(index)" @validate-quantity="validateIngredientQuantity(index)"
                  @validate-unit="validateIngredientUnit(index)" @remove="removeIngredient(index)" />
              </div>

              <span v-if="errors.ingredients" class="error">
                <i class="fa fa-warning"></i> {{ errors.ingredients }}
              </span>
            </div>
          </div>

          <!-- Botones de navegación -->
          <div class="navegation-buttons">
            <button type="button" v-if="currentStep > 1" @click="prevStep" class="prev-button">
              ⏪ Anterior
            </button>
            <button type="button" v-if="currentStep < 3" @click="nextStep" class="next-button">
              Siguiente
            </button>
          </div>

          <button type="submit" v-if="currentStep === 3" class="submit-button" :disabled="loading || !validateForm()">
            {{ postToEdit ? 'Guardar cambios' : 'Subir post' }}
          </button>
        </form>
      </main>
    </section>
  </div>
</template>

<script>
import { useNotificationStore } from '../stores/notification';
import { apiService } from '../services/api';
import IngredientInput from '../components/IngredientInput.vue';

export default {
  name: 'Crear',
  components: {
    IngredientInput
  },
  props: {
    postToEdit: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      notificationStore: useNotificationStore(),
      currentStep: 1,
      post: {
        title: '',
        description: '',
        image: null,
        is_private: false,
        ingredients: [{ name: '', quantity: '', unit: '' }]
      },
      imagePreviewUrl: '',
      loading: false,
      errors: {},
      selectedFileName: '',
      maxDescriptionLength: 300,
      isIngredientListValid: false // Nueva propiedad para rastrear la validez de la lista de ingredientes
    };
  },
  watch: {
    postToEdit: {
      immediate: true,
      handler(newPost) {
        if (newPost) {
          // Título, descripción y privacidad
          this.post.title = newPost.title || '';
          this.post.description = newPost.description || '';
          this.post.is_private = newPost.is_private || false;

          // Ingredientes (parsed)
          this.post.ingredients = this.parseIngredients(newPost.ingredients);

          // Imagen
          if (newPost.imagen) {
            this.imagePreviewUrl = newPost.imagen;
            this.post.image = newPost.imagen;
          } else {
            this.imagePreviewUrl = '';
            this.post.image = null;
          }
        }
      }
    },
    'post.title'() {
      this.validateTitle();
    },
    'post.description'() {
      this.validateDescription();
    },
    'post.ingredients': {
      deep: true,
      handler() {
        this.validateIngredients();
      }
    }
  },
  methods: {
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
          this.errors.image = 'Solo se permiten JPEG, PNG, GIF o WEBP.';
          this.selectedFileName = '';
          this.post.image = null;
          this.imagePreviewUrl = '';
          return;
        }
        this.selectedFileName = file.name;
        this.post.image = file;
        this.errors.image = '';
        this.imagePreviewUrl = URL.createObjectURL(file);
      } else {
        this.selectedFileName = '';
        this.post.image = null;
        this.imagePreviewUrl = '';
      }
    },

    addIngredient() {
      const lastIdx = this.post.ingredients.length - 1;
      const lastIngr = this.post.ingredients[lastIdx];

      // Validar último ingrediente
      if (!lastIngr.name || !lastIngr.name.trim()) {
        this.errors[`ingredient_name_${lastIdx}`] = 'El nombre es requerido.';
        return;
      }
      if (lastIngr.quantity === '' || lastIngr.quantity == null) {
        this.errors[`ingredient_quantity_${lastIdx}`] = 'La cantidad es requerida.';
        return;
      }
      if (!lastIngr.unit || !lastIngr.unit.trim()) {
        this.errors[`ingredient_unit_${lastIdx}`] = 'La unidad es requerida.';
        return;
      }

      // Limpiar errores y agregar uno nuevo
      this.errors[`ingredient_name_${lastIdx}`] = '';
      this.errors[`ingredient_quantity_${lastIdx}`] = '';
      this.errors[`ingredient_unit_${lastIdx}`] = '';
      this.post.ingredients.push({ name: '', quantity: '', unit: '' });
    },

    removeIngredient(index) {
      if (this.post.ingredients.length > 1) {
        this.post.ingredients.splice(index, 1);
      }
    },

    removeLastIngredient() {
      if (this.post.ingredients.length > 1) {
        this.post.ingredients.pop();
      }
    },

    updateIngredient(index, updated) {
      this.post.ingredients.splice(index, 1, updated);
    },

    parseIngredients(raw) {
      if (!raw) return [{ name: '', quantity: '', unit: '' }];
      try {
        const parsed = JSON.parse(raw);
        return parsed.map((ing) => {
          const [qty, unit, ...rest] = ing.quantity.split(' ');
          return {
            name: ing.name,
            quantity: qty || '',
            unit: unit || ''
          };
        });
      } catch {
        return [{ name: '', quantity: '', unit: '' }];
      }
    },

    validateTitle() {
      if (!this.post.title || !this.post.title.trim()) {
        this.errors.title = 'El título es requerido.';
      } else if (this.post.title.trim().length < 3) {
        this.errors.title = 'Debe tener al menos 3 caracteres.';
      } else {
        this.errors.title = '';
      }
    },

    validateDescription() {
      if (!this.post.description || !this.post.description.trim()) {
        this.errors.content = 'La descripción es requerida.';
      } else if (this.post.description.trim().length < 10) {
        this.errors.content = 'Debe tener al menos 10 caracteres.';
      } else {
        this.errors.content = '';
      }
    },

    validateIngredients() {
      this.errors.ingredients = '';
      this.post.ingredients.forEach((ing, i) => {
        if (!ing.name || !ing.name.trim()) {
          this.errors[`ingredient_name_${i}`] = 'El nombre es requerido.';
        } else {
          this.errors[`ingredient_name_${i}`] = '';
        }
        if (ing.quantity === '' || ing.quantity == null) {
          this.errors[`ingredient_quantity_${i}`] = 'La cantidad es requerida.';
        } else if (ing.quantity <= 0) {
          this.errors[`ingredient_quantity_${i}`] = 'Debe ser mayor a 0.';
        } else {
          this.errors[`ingredient_quantity_${i}`] = '';
        }
        if (!ing.unit || !ing.unit.trim()) {
          this.errors[`ingredient_unit_${i}`] = 'La unidad es requerida.';
        } else {
          this.errors[`ingredient_unit_${i}`] = '';
        }
      });
    },

    validateIngredientName(index) {
      const ing = this.post.ingredients[index];
      if (!ing.name || !ing.name.trim()) {
        this.errors[`ingredient_name_${index}`] = 'El nombre es requerido.';
      } else {
        this.errors[`ingredient_name_${index}`] = '';
      }
    },

    validateIngredientQuantity(index) {
      const ing = this.post.ingredients[index];
      if (ing.quantity === '' || ing.quantity == null) {
        this.errors[`ingredient_quantity_${index}`] =
          'La cantidad es requerida.';
      } else if (ing.quantity <= 0) {
        this.errors[`ingredient_quantity_${index}`] =
          'La cantidad debe ser mayor a 0.';
      } else {
        this.errors[`ingredient_quantity_${index}`] = '';
      }
    },

    validateIngredientUnit(index) {
      const ing = this.post.ingredients[index];
      if (!ing.unit || !ing.unit.trim()) {
        this.errors[`ingredient_unit_${index}`] = 'La unidad es requerida.';
      } else {
        this.errors[`ingredient_unit_${index}`] = '';
      }
    },

    handleIngredientValidation(isValid) {
      this.isIngredientListValid = isValid;
    },

    validateForm() {
      this.validateTitle();
      this.validateDescription();
      return (
        !Object.values(this.errors).some((e) => e) &&
        this.isIngredientListValid // Validar que la lista de ingredientes no esté vacía
      );
    },

    async handleSubmit() {
      if (!this.validateForm()) {
        this.notificationStore.show(
          "Por favor, completa todos los campos antes de enviar.",
          "error"
        );
        return;
      }

      this.loading = true;
      const ingredientsPayload = this.post.ingredients.map((ing) => ({
        name: ing.name,
        quantity: `${ing.quantity} ${ing.unit}`.trim()
      }));

      const formData = new FormData();
      formData.append('title', this.post.title);
      formData.append('description', this.post.description);
      formData.append('is_private', this.post.is_private);
      formData.append('ingredients', JSON.stringify(ingredientsPayload));
      if (this.post.image) {
        formData.append('imagen', this.post.image);
      }

      try {
        const response = this.postToEdit
          ? await apiService.updatePost(this.postToEdit.id, formData)
          : await apiService.createPost(formData);

        if (response.data.status === 'success') {
          const msg = this.postToEdit
            ? 'Post actualizado correctamente'
            : 'Post creado correctamente';
          this.notificationStore.show(msg, 'success');
          this.$emit(
            this.postToEdit ? 'post-updated' : 'post-created',
            response.data.data
          );
          this.closeModal();
        }
      } catch (err) {
        console.error('Error al procesar el post:', err);
        this.notificationStore.show(
          'Ocurrió un error al procesar el formulario.',
          'error'
        );
      } finally {
        this.loading = false;
      }
    },

    closeModal() {
      this.$emit('close');
    },

    nextStep() {
      if (this.currentStep === 1 && !this.post.image) {
        this.errors.image = 'Debes seleccionar una imagen.';
        return;
      }
      if (
        this.currentStep === 2 &&
        (!this.post.title || !this.post.description)
      ) {
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

.crear-post-container {
  grid-area: var(--main-area);
  background-color: var(--secundary-color);
  border-radius: 10px;
  width: 90%;
  margin: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  max-width: 700px;
  max-height: 600px;
}

.crear-post-container header {
  background-color: var(--primary-color);
  border-radius: 10px 10px 0 0;
  padding: 20px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.crear-post-container header h2 {
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
  height: auto;

}

form {
  display: flex;
  flex-direction: column;
  width: 80%;
  margin: 0 auto;
  align-items: stretch;
  justify-content: center;
  flex-wrap: wrap;
  align-content: center;
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
  width: 90%;
}

.input-with-error {
  display: flex;
  flex-direction: row;
  flex: 1;
  align-content: center;
  align-items: stretch;
  gap: 1em;
  width: 100%;
}

.input-ingredient {
  width: 100px;
  padding: 10px;
  border: 1px solid var(--sombra-color);
  border-radius: 6px;
  background-color: white;
  color: black;
  font-size: 14px;
}

.small-textarea {
  min-height: 80px;
}

.ingredients-container {
  margin-top: 20px;
}

.ingredients-list {
  max-height: 300px;
  overflow-y: hidden;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: stretch;
  justify-content: space-evenly;
  align-items: baseline;
}

.ingredient-input {
  display: flex;
  flex-direction: column;
  align-items: baseline;
  margin-bottom: 5px;
  align-content: center;
  justify-content: center;
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
  width: 100%;
}

.global-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 1em;
}

.add-button,
.remove-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  padding: 10px 20px;
  font-size: 14px;
}

.remove-button {
  background-color: var(--contrast-color);
}

.add-button:hover,
.remove-button:hover {
  opacity: 0.9;
}

.remove-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.unit-select {
  padding: 10px;
  border: 1px solid var(--sombra-color);
  border-radius: 6px;
  background-color: white;
  color: black;
  font-size: 14px;
  width: 100%;
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

.navegation-buttons {
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
.next-button:hover,
.submit-button:hover {
  background-color: var(--primary-color-dark);
}

.step {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

/* Media queries para responsivo */
@media (max-width: 768px) {

  .crear-post-container main {
    flex-direction: column;
    align-items: center;
    margin: 0;
    padding: 20px;
  }

  form {
    width: 90%;
  }
}

@media (max-width: 600px) {
  .ingredients-container {
    margin: 0;
  }

  .input-ingredient {
    width: 100%;
  }

  .ingredient-input {
    gap: 0;
  }

  .image-preview {
    width: 20%;
  }
}

@media (max-width: 480px) {
  section main {
    padding: 30px;
  }

  input,
  textarea,
  button[type='submit'] {
    padding: 12px;
  }

  button[type='submit'] {
    margin: 1em;
  }

  .input-with-error {
    flex-direction: column;
    gap: 0;
  }

  .unit-select {
    width: 100%;
  }
}
</style>
