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
        <label>
          Contraseña:
          <input 
            type="password" 
            v-model="password" 
            required
          />
        </label>
        <button type="submit" :disabled="loading">
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
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notification'

export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      loading: false
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true
      const authStore = useAuthStore()
      const notificationStore = useNotificationStore()
      try {
        await authStore.login(this.email, this.password)
        this.$router.push('/home')
        notificationStore.showNotification('Inicio de sesión exitoso', 'success')
      } catch (error) {
        notificationStore.showNotification(
          error.message || 'Error al iniciar sesión',
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
    gap: 30px; /* Aumentado el espacio entre elementos */
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

/* Media queries */
@media (max-width: 768px) {
    section {
        width: 80%;
        height: auto;
        min-height: 600px; /* Ajustado la altura mínima */
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

</style>
