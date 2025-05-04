<template>
  <section>
    <header>
      <h2>Iniciar sesión</h2>
    </header>
    <main>
      <div class="separador">
        <div class="linea"></div>
        <div class="circulo">🧑‍🍳</div>
        <div class="linea"></div>
      </div>
      
      <form @submit.prevent="handleLogin">
        <label>
          Email:
          <input 
            type="email" 
            v-model="email" 
            required
          />
        </label>
        <p v-if="emailError" class="error">{{ emailError }}</p>
        <label class="password-label">
          Contraseña:
          <div class="password-input-container">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              v-model="password" 
              required
            />
            <button type="button" class="toggle-password-button" @click="togglePassword">
              <i :class="['fas', showPassword ? 'fa-eye-slash' : 'fa-eye']"></i>
            </button>
          </div>
        </label>
        <p v-if="passwordError" class="error">{{ passwordError }}</p>
        <button type="submit" :disabled="loading || emailError || passwordError">
          {{ loading ? 'Cargando...' : 'Iniciar sesión' }}
        </button>
      </form>

      <p class="registro">
        ¿No tienes cuenta? <a href="/register">Regístrate</a>
      </p>
    </main>
  </section>
</template>

<script>
import { useUserStore } from '../stores/user'
import { useNotificationStore } from '../stores/notification'
import { apiService } from '../services/api'

export default {
  name: 'Login',

  data() {
    return {
      email: '',
      password: '',
      loading: false,
      showPassword: false
    }
  },
  computed: {
    emailError() {
      // Valida que el email no esté vacío y cumpla con el patrón estándar
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!this.email || this.email.trim().length === 0) {
        return "El email es obligatorio.";
      } else if (!emailRegex.test(this.email)) {
        return "Introduce un email válido.";
      }
      return null;
    },
    passwordError() {
      // Se valida que la contraseña no esté vacía y tenga al menos 6 caracteres.
      if (!this.password || this.password.length === 0) {
        return "La contraseña es obligatoria.";
      } else if (this.password.length < 6) {
        return "La contraseña debe tener al menos 6 caracteres.";
      }
      return null;
    }
  },
  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
    async handleLogin() {
      // Si existen errores de validación, no se envía el formulario.
      if (this.emailError || this.passwordError) return;
      this.loading = true
      try {
        const credentials = {
          email: this.email.trim(),
          password: this.password
        }

        const response = await apiService.login(credentials)

        if (response.data.status === 'success') {
          const userStore = useUserStore()
          userStore.setToken(response.data.data.token)
          userStore.setUser(response.data.data.user)
          
          const notificationStore = useNotificationStore()
          notificationStore.show('Inicio de sesión exitoso', 'success')

          this.$router.push('/profile')
        }
      } catch (error) {
        console.error('Error de login:', error)
        const notificationStore = useNotificationStore()
        notificationStore.show(
          error.response?.data?.message || 'Error al iniciar sesión',
          'error'
        )
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
section {
    grid-area: var(--main-area);
    background-color: var(--secundary-color);
    border-radius: 10px;
    width: 600px;
    height: 600px; /* Aumentado de 450px a 600px */
    margin: auto auto;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
}
.oculto~section{
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: fit-content;
  z-index: 1;
}

section header {
    background-color: var(--primary-color);
    border-radius: 10px 10px 0 0;
    padding: 20px;
    text-align: center;
}

section header h2 {
    font-size: 24px;
    color: var(--text-color-important);
}

section main {
    padding: 50px; /* Aumentado el padding para mejor espaciado */
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

section main form {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 80%;
    margin: 0 auto;
}

section main form label {
    width: 100%;
    text-align: left; /* Alineación del texto a la izquierda */
}

section main form input {
    width: 100%;
    padding: 15px; /* Aumentado el padding de los inputs */
    margin-top: 8px;
    border: 1px solid var(--sombra-color);
    color: black;
    border-radius: 6px;
    font-size: 16px;
}

section main form button {
    width: 100%;
    padding: 15px; /* Aumentado el padding del botón */
    border: none;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    background: var(--contrast-color);
    color: var(--text-color);
    transition: background-color 0.2s;
}

section main form button:hover {
    opacity: 0.9;
}

.registro {
    text-align: center;
    margin-top: 20px;
    font-size: 16px;
}

.registro a {
    color: var(--contrast-color);
    text-decoration: none;
    font-weight: 500;
}

.registro a:hover {
    text-decoration: underline;
}

@media (max-width: 600px) {
    section {
      grid-area: var(--main-responsive-area);
    }
}
/* Media queries */
@media (max-width: 768px) {
    section {
        width: 80%;
        height: fit-content; 
    }
}

@media (max-width: 480px) {
    section {
        width: 90%;
        margin: 15px auto;
    }

    section main form {
        width: 90%;
    }
}

section main .separador{
    display: flex;
    flex-direction: row;
}
section main .separador .linea{
    position: relative;
    top: 0.75em;
    background-color: black;
    height: 1px;
    flex-grow: 1;
    flex-shrink: 1;
}
section main .separador .circulo{
    padding: 0 10px;
}

section main form span{
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 22px;
}
section main form a {
    margin: 0 10px;
    color: var(--text-color);
    font-size: 22px;
}
section main form a:hover {
    font-weight: bold;
}
section main form label .toolkit{
    font-size: 12px;
}

.password-input-container {
  position: relative;
    display: flex;
    align-items: center;
    flex-direction: row;
    flex-wrap: nowrap;
    align-content: center;
    justify-content: center;
}
.password-input-container input {
  width: 100%;
  /* Aumenta el padding-right si lo necesitas para que no se superponga el botón */
  padding-right: 40px;
}
.toggle-password-button {
  background: transparent;
    width: 0;
    border: none;
    cursor: pointer;
    outline: none;
    transition: transform 0.3s ease;
    padding: 0 10px;
}
.toggle-password-button:focus {
  transform: translateY(-50%) scale(1.2);
}

.error {
  color: red;
  font-size: 0.9em;
  margin-top: 5px;
}
</style>
