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
    border-radius: 5px;
    width: 30%;
    height: 60%;
    margin: auto auto;
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

section main{
    margin: 10px 0;
    padding: 0 40px;
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

section main form {
    margin: 20px auto;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
}
section main form label {
    display: flex;
    flex-direction: column;
    width: 100%;
    text-align: left;
    color: var(--text-color);
}
section main form input {
    border: 2px solid var(--sombra-color);
    padding: 5px;
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
section main form button {
    color: var(--text-color);
    background:  var(--contrast-color);
    border: none;
    padding: 10px 40px;
    border-radius: 10px;
    font-size: 22px;
    cursor: pointer;
}
section main form label .toolkit{
    font-size: 12px;
}
.registro{
    padding: 0 0 40px 0;
    font-size: 22px;
    color: var(--text-color);
}
.registro a{
    color: var(--text-color);
}
.registro a:hover{
    font-weight: bold;
}

</style>
