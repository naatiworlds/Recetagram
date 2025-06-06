<template>
  <main class="contact-page">
    <h1>Contacto</h1>
    <p>Si tienes alguna pregunta o sugerencia, no dudes en contactarnos.</p>
    <form @submit.prevent="handleSubmit" class="contact-form">
      <div class="form-group">
        <label for="name">Nombre</label>
        <input
          type="text"
          id="name"
          v-model="form.name"
          placeholder="Tu nombre"
          @input="validateField('name')"
          required
        />
        <span v-if="errors.name" class="error">
          <i class="fa fa-warning"></i> {{ errors.name }}
        </span>
      </div>

      <div class="form-group">
        <label for="email">Correo Electrónico</label>
        <input
          type="email"
          id="email"
          v-model="form.email"
          placeholder="Tu correo electrónico"
          @input="validateField('email')"
          required
        />
        <span v-if="errors.email" class="error">
          <i class="fa fa-warning"></i> {{ errors.email }}
        </span>
      </div>

      <div class="form-group">
        <label for="message">Mensaje</label>
        <textarea
          id="message"
          v-model="form.message"
          placeholder="Escribe tu mensaje aquí"
          rows="5"
          @input="validateField('message')"
          :maxlength="validationRules.message.max"
          required
        ></textarea>
        <span v-if="errors.message" class="error">
          <i class="fa fa-warning"></i> {{ errors.message }}
        </span>
        <span class="char-counter">
          {{ form.message.length }} / {{ validationRules.message.max }} caracteres
        </span>
      </div>

      <button type="submit" class="submit-button">Enviar</button>
    </form>
  </main>
</template>

<script>
export default {
  name: 'Contacto',
  data() {
    return {
      form: {
        name: '',
        email: '',
        message: ''
      },
      errors: {
        name: '',
        email: '',
        message: ''
      },
      validationRules: {
        name: { min: 3, max: 50 },
        message: { min: 10, max: 500 } // Máximo de 500 caracteres para el mensaje
      }
    };
  },
  methods: {
    validateField(field) {
      // Validar nombre
      if (field === 'name') {
        const { min, max } = this.validationRules.name;
        if (!this.form.name.trim()) {
          this.errors.name = 'El nombre es obligatorio.';
        } else if (this.form.name.length < min) {
          this.errors.name = `El nombre debe tener al menos ${min} caracteres.`;
        } else if (this.form.name.length > max) {
          this.errors.name = `El nombre no puede tener más de ${max} caracteres.`;
        } else {
          this.errors.name = '';
        }
      }

      // Validar correo electrónico
      if (field === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!this.form.email.trim()) {
          this.errors.email = 'El correo electrónico es obligatorio.';
        } else if (!emailRegex.test(this.form.email)) {
          this.errors.email = 'El correo electrónico no es válido.';
        } else {
          this.errors.email = '';
        }
      }

      // Validar mensaje
      if (field === 'message') {
        const { min, max } = this.validationRules.message;
        if (!this.form.message.trim()) {
          this.errors.message = 'El mensaje es obligatorio.';
        } else if (this.form.message.length < min) {
          this.errors.message = `El mensaje debe tener al menos ${min} caracteres.`;
        } else if (this.form.message.length > max) {
          this.errors.message = `El mensaje no puede tener más de ${max} caracteres.`;
        } else {
          this.errors.message = '';
        }
      }
    },
    validateForm() {
      let isValid = true;

      // Validar todos los campos
      this.validateField('name');
      this.validateField('email');
      this.validateField('message');

      // Verificar si hay errores
      if (this.errors.name || this.errors.email || this.errors.message) {
        isValid = false;
      }

      return isValid;
    },
    handleSubmit() {
      if (this.validateForm()) {
        console.log('Formulario válido:', this.form);
        // Preparar la función para enviar los datos en el futuro
        this.sendData();
      }
    },
    sendData() {
      // Esta función se implementará en el futuro para enviar los datos
      console.log('Preparando para enviar los datos:', this.form);
    }
  }
};
</script>

<style scoped>
.contact-page {
    width: 100%;
    max-width: 700px;
    max-height: 600px;
    margin: auto auto;
    background-color: var(--secundary-color);
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.oculto~.contact-page {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    z-index: 1;
}

.contact-page h1 {
    background-color: var(--primary-color);
    border-radius: 10px 10px 0 0;
    padding: 20px;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
}

.contact-page p {
    padding: 20px;
    text-align: center;
    color: var(--text-color);
    margin-bottom: 20px;
}

.contact-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 20px;

}

.form-group {
    display: flex;
    flex-direction: column;
}

.form-group label {
    font-weight: bold;
    color: var(--text-color-important);
    margin-bottom: 5px;
}

.form-group input,
.form-group textarea {
    padding: 10px;
    border: 1px solid var(--border-color);
    border-radius: 5px;
    color: var(--text-color);
    font-size: 1rem;
    resize: none;
}

.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: var(--contrast-color);
}

.error {
    color: var(--contrast-color);
    font-size: 0.9rem;
    margin-top: 5px;
}

.submit-button {
    padding: 10px 20px;
    background-color: var(--primary-color);
    color: var(--text-color-important);
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    text-align: center;
}
.char-counter {
  font-size: 0.9rem;
  color: var(--text-color);
  margin-top: 5px;
  text-align: right;
}


@media (max-width: 768px) {
    .contact-page{
        width: 90%;
    }
    .oculto~.contact-page {
        width: 90%;
    }
}

@media (max-width: 600px) {
    .contact-page {
        grid-area: var(--main-responsive-area);
        height: 90%;
    }
}
</style>